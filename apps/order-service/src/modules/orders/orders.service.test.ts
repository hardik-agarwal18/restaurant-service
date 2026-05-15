import type {
  CreateOrderRepoInput,
  OrdersRepository,
  OrderWithItems,
} from "./orders.repository.js";
import { OrdersService } from "./orders.service.js";

test("computes monetary totals deterministically", async () => {
  const createOrderWithOutbox = jest.fn<Promise<OrderWithItems>, [CreateOrderRepoInput]>(
    async () => {
      return { id: "order_1" } as unknown as OrderWithItems;
    }
  );

  const repo = {
    createOrderWithOutbox,
  } as unknown as OrdersRepository;

  const service = new OrdersService(repo);

  await service.createOrder({
    tenantId: "tenant_1",
    userId: "user_1",
    input: {
      branchId: "branch_1",
      type: "DINE_IN",
      items: [
        {
          menuItemId: "m1",
          name: "Pizza",
          quantity: 2,
          unitPrice: 10,
          taxPercent: 10,
        },
      ],
    },
  });

  expect(createOrderWithOutbox).toHaveBeenCalledTimes(1);
  const callInput = createOrderWithOutbox.mock.calls[0][0];
  expect(callInput.subtotal.toFixed(2)).toBe("20.00");
  expect(callInput.taxTotal.toFixed(2)).toBe("2.00");
  expect(callInput.grandTotal.toFixed(2)).toBe("22.00");
  expect(callInput.items[0]?.total.toFixed(2)).toBe("20.00");
});

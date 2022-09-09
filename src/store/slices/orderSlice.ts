import { Bill as BillModel } from '@database/models/billModel';
import { Order as OrderModel } from '@database/models/orderModel';
import { Product as ProductModel } from '@database/models/productModel';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GetOrder {
  billId: string;
}

export interface NewOrder {
  quantity: number;
  productId: string;
  billId: string;
}

export interface RemovedOrder {
  order: OrderModel;
}

export interface UpdatedOrder extends RemovedOrder {
  updatedOrder: {
    quantity?: number;
    productId?: string;
    billId?: string;
  };
}

export interface OrdersResponse {
  id: string;
  productId: string;
  billId: string;
  quantity: number;
  product: ProductModel;
  bill: BillModel;
}

interface OrderState {
  isLoading: boolean;
  error: string | null;

  allOrdersClient: OrdersResponse[] | null;
}

const initialState: OrderState = {
  isLoading: false,
  error: null,

  allOrdersClient: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    GETL_ORDERS: (state, _: PayloadAction<GetOrder>) => ({
      ...state,
      isLoading: true,

      error: null,
    }),

    GETL_ORDERS_SUCCESS: (
      state,
      {
        payload: { allOrdersClient },
      }: PayloadAction<{ allOrdersClient: OrdersResponse[] }>,
    ) => ({
      ...state,
      isLoading: false,

      allOrdersClient,
    }),

    GETL_ORDERS_FAILURE: (
      state,
      { payload: { error } }: PayloadAction<{ error: string }>,
    ) => ({
      ...state,
      isLoading: false,
      error,
    }),

    CREATE_ORDER: (state, _: PayloadAction<NewOrder>) => ({
      ...state,
      isLoading: true,
      error: null,
    }),

    CREATE_ORDER_SUCCESS: state => ({
      ...state,
      isLoading: false,
      error: null,
    }),

    CREATE_ORDER_FAILURE: (
      state,
      { payload: { error } }: PayloadAction<{ error: string }>,
    ) => ({
      ...state,
      isLoading: false,
      error,
    }),

    UPDATE_ORDER: (state, _: PayloadAction<UpdatedOrder>) => ({
      ...state,
      isLoading: true,
      error: null,
    }),

    UPDATE_ORDER_SUCCESS: state => ({
      ...state,
      isLoading: false,
      error: null,
    }),

    UPDATE_ORDER_FAILURE: (
      state,
      { payload: { error } }: PayloadAction<{ error: string }>,
    ) => ({
      ...state,
      isLoading: false,
      error,
    }),

    REMOVE_ORDER: (state, _: PayloadAction<RemovedOrder>) => ({
      ...state,
      isLoading: true,
      error: null,
    }),

    REMOVE_ORDER_SUCCESS: state => ({
      ...state,
      isLoading: false,
      error: null,
    }),

    REMOVE_ORDER_FAILURE: (
      state,
      { payload: { error } }: PayloadAction<{ error: string }>,
    ) => ({
      ...state,
      isLoading: false,
      error,
    }),
  },
});

const { actions, reducer } = orderSlice;

export const orderState = initialState;

export const {
  GETL_ORDERS,
  GETL_ORDERS_SUCCESS,
  GETL_ORDERS_FAILURE,
  CREATE_ORDER,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  UPDATE_ORDER,
  UPDATE_ORDER_SUCCESS,
  UPDATE_ORDER_FAILURE,
  REMOVE_ORDER,
  REMOVE_ORDER_SUCCESS,
  REMOVE_ORDER_FAILURE,
} = actions;

export default reducer;

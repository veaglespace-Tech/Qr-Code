'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'Product', 'Order', 'Setting', 'Admin', 'Superadmin', 'Payout', 'User'],
  endpoints: (builder) => ({
    // ---------------- AUTH ENDPOINTS ----------------
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'Order', 'Admin', 'Superadmin'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'Admin', 'Superadmin', 'User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Order', 'Admin', 'Superadmin'],
    }),

    // ---------------- PRODUCT ENDPOINTS ----------------
    getProducts: builder.query({
      query: () => '/products',
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    uploadProductImage: builder.mutation({
      query: (body) => ({
        url: '/products/upload-image',
        method: 'POST',
        body,
      }),
    }),

    // ---------------- SETTINGS ENDPOINTS ----------------
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Setting'],
    }),
    updateSettings: builder.mutation({
      query: (patch) => ({
        url: '/settings',
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Setting'],
    }),

    // ---------------- ORDER ENDPOINTS ----------------
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Admin', 'Superadmin'],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order',
        'Admin',
        'Superadmin',
      ],
    }),

    // ---------------- ADMIN / PARTNER ENDPOINTS ----------------
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),
    requestPayout: builder.mutation({
      query: (data) => ({
        url: '/admin/payouts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'Payout', 'Superadmin'],
    }),
    updateBankDetails: builder.mutation({
      query: (details) => ({
        url: '/admin/bank-details',
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Admin', 'Auth'],
    }),

    // ---------------- SUPERADMIN ENDPOINTS ----------------
    getAnalytics: builder.query({
      query: () => '/superadmin/analytics',
      providesTags: ['Superadmin'],
    }),
    getAllAdmins: builder.query({
      query: () => '/superadmin/admins',
      providesTags: ['Superadmin', 'Admin'],
    }),
    updateAdmin: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/superadmin/admins/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Superadmin', 'Admin'],
    }),
    getAllUsers: builder.query({
      query: () => '/superadmin/users',
      providesTags: ['Superadmin', 'User'],
    }),
    getAllPayouts: builder.query({
      query: () => '/superadmin/payouts',
      providesTags: ['Payout', 'Superadmin'],
    }),
    updatePayoutStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/superadmin/payouts/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Payout', 'Superadmin', 'Admin'],
    }),
  }),
});

export const {
  // Auth hooks
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,

  // Product hooks
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,

  // Settings hooks
  useGetSettingsQuery,
  useUpdateSettingsMutation,

  // Order hooks
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,

  // Admin hooks
  useGetAdminStatsQuery,
  useRequestPayoutMutation,
  useUpdateBankDetailsMutation,

  // Superadmin hooks
  useGetAnalyticsQuery,
  useGetAllAdminsQuery,
  useUpdateAdminMutation,
  useGetAllUsersQuery,
  useGetAllPayoutsQuery,
  useUpdatePayoutStatusMutation,
} = apiSlice;

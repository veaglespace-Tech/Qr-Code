'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'Product', 'Order', 'Setting', 'Admin', 'Superadmin', 'Payout', 'User', 'PartnerLink'],
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
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    sendPartnerOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/send-partner-otp',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPartnerOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-partner-otp',
        method: 'POST',
        body: data,
      }),
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
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Auth', 'Admin', 'Superadmin', 'User'],
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
    reorderProducts: builder.mutation({
      query: (body) => ({
        url: '/products/batch/reorder',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
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
    getAdminById: builder.query({
      query: (id) => `/superadmin/admins/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),
    updateAdmin: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/superadmin/admins/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Superadmin', 'Admin', { type: 'Admin', id }],
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/superadmin/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Superadmin', 'Admin'],
    }),
    getAllUsers: builder.query({
      query: () => '/superadmin/users',
      providesTags: ['Superadmin', 'User'],
    }),
    getUserById: builder.query({
      query: (id) => `/superadmin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/superadmin/users/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Superadmin', 'User', { type: 'User', id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/superadmin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Superadmin', 'User'],
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

    // ---------------- PARTNER PRODUCT LINKS ----------------
    getMyProductLinks: builder.query({
      query: () => '/admin/product-links',
      providesTags: ['PartnerLink'],
    }),
    generateProductLink: builder.mutation({
      query: (body) => ({
        url: '/admin/product-links',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PartnerLink'],
    }),
    toggleProductLink: builder.mutation({
      query: (id) => ({
        url: `/admin/product-links/${id}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['PartnerLink'],
    }),

    // ---------------- PUBLIC LINK RESOLUTION ----------------
    resolveProductLink: builder.query({
      query: (linkCode) => `/buy/${linkCode}`,
    }),
  }),
});

export const {
  // Auth hooks
  useGetMeQuery,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendPartnerOtpMutation,
  useVerifyPartnerOtpMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,

  // Product hooks
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useReorderProductsMutation,

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
  useGetAdminByIdQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllPayoutsQuery,
  useUpdatePayoutStatusMutation,

  // Partner product link hooks
  useGetMyProductLinksQuery,
  useGenerateProductLinkMutation,
  useToggleProductLinkMutation,
  useResolveProductLinkQuery,
} = apiSlice;

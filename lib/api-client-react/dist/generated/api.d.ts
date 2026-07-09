import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, ErrorResponse, HealthStatus, HelpRequest, HelpRequestInput, ListRequestsParams, LoginInput, RegisterInput, RequestsSummary, SuccessResponse, User } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login with phone and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login with phone and password
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current user
 */
export declare const logout: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListRequestsUrl: (params?: ListRequestsParams) => string;
/**
 * @summary List all active help requests
 */
export declare const listRequests: (params?: ListRequestsParams, options?: RequestInit) => Promise<HelpRequest[]>;
export declare const getListRequestsQueryKey: (params?: ListRequestsParams) => readonly ["/api/requests", ...ListRequestsParams[]];
export declare const getListRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listRequests>>, TError = ErrorType<unknown>>(params?: ListRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listRequests>>>;
export type ListRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List all active help requests
 */
export declare function useListRequests<TData = Awaited<ReturnType<typeof listRequests>>, TError = ErrorType<unknown>>(params?: ListRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRequestUrl: () => string;
/**
 * @summary Create a new help request
 */
export declare const createRequest: (helpRequestInput: HelpRequestInput, options?: RequestInit) => Promise<HelpRequest>;
export declare const getCreateRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
        data: BodyType<HelpRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
    data: BodyType<HelpRequestInput>;
}, TContext>;
export type CreateRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createRequest>>>;
export type CreateRequestMutationBody = BodyType<HelpRequestInput>;
export type CreateRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new help request
*/
export declare const useCreateRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRequest>>, TError, {
        data: BodyType<HelpRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRequest>>, TError, {
    data: BodyType<HelpRequestInput>;
}, TContext>;
export declare const getGetRequestsSummaryUrl: () => string;
/**
 * @summary Get summary stats for requests dashboard
 */
export declare const getRequestsSummary: (options?: RequestInit) => Promise<RequestsSummary>;
export declare const getGetRequestsSummaryQueryKey: () => readonly ["/api/requests/summary"];
export declare const getGetRequestsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getRequestsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequestsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRequestsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRequestsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getRequestsSummary>>>;
export type GetRequestsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get summary stats for requests dashboard
 */
export declare function useGetRequestsSummary<TData = Awaited<ReturnType<typeof getRequestsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequestsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMyRequestsUrl: () => string;
/**
 * @summary Get requests created by the current student
 */
export declare const getMyRequests: (options?: RequestInit) => Promise<HelpRequest[]>;
export declare const getGetMyRequestsQueryKey: () => readonly ["/api/requests/my"];
export declare const getGetMyRequestsQueryOptions: <TData = Awaited<ReturnType<typeof getMyRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyRequests>>>;
export type GetMyRequestsQueryError = ErrorType<unknown>;
/**
 * @summary Get requests created by the current student
 */
export declare function useGetMyRequests<TData = Awaited<ReturnType<typeof getMyRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRequestUrl: (id: number) => string;
/**
 * @summary Get a specific help request
 */
export declare const getRequest: (id: number, options?: RequestInit) => Promise<HelpRequest>;
export declare const getGetRequestQueryKey: (id: number) => readonly [`/api/requests/${number}`];
export declare const getGetRequestQueryOptions: <TData = Awaited<ReturnType<typeof getRequest>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRequestQueryResult = NonNullable<Awaited<ReturnType<typeof getRequest>>>;
export type GetRequestQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a specific help request
 */
export declare function useGetRequest<TData = Awaited<ReturnType<typeof getRequest>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRequest>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDeleteRequestUrl: (id: number) => string;
/**
 * @summary Delete a help request (student only)
 */
export declare const deleteRequest: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteRequest>>, TError, {
    id: number;
}, TContext>;
export type DeleteRequestMutationResult = NonNullable<Awaited<ReturnType<typeof deleteRequest>>>;
export type DeleteRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a help request (student only)
*/
export declare const useDeleteRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteRequest>>, TError, {
    id: number;
}, TContext>;
export declare const getVolunteerForRequestUrl: (id: number) => string;
/**
 * @summary Volunteer accepts a help request
 */
export declare const volunteerForRequest: (id: number, options?: RequestInit) => Promise<HelpRequest>;
export declare const getVolunteerForRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof volunteerForRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof volunteerForRequest>>, TError, {
    id: number;
}, TContext>;
export type VolunteerForRequestMutationResult = NonNullable<Awaited<ReturnType<typeof volunteerForRequest>>>;
export type VolunteerForRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Volunteer accepts a help request
*/
export declare const useVolunteerForRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof volunteerForRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof volunteerForRequest>>, TError, {
    id: number;
}, TContext>;
export declare const getCompleteRequestUrl: (id: number) => string;
/**
 * @summary Student marks a request as completed
 */
export declare const completeRequest: (id: number, options?: RequestInit) => Promise<HelpRequest>;
export declare const getCompleteRequestMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof completeRequest>>, TError, {
    id: number;
}, TContext>;
export type CompleteRequestMutationResult = NonNullable<Awaited<ReturnType<typeof completeRequest>>>;
export type CompleteRequestMutationError = ErrorType<ErrorResponse>;
/**
* @summary Student marks a request as completed
*/
export declare const useCompleteRequest: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeRequest>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof completeRequest>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
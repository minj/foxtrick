export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Ensure<U, K extends PropertyKey> =
	K extends keyof U
	? Require<U, K>
	: U & Record<K, unknown>;

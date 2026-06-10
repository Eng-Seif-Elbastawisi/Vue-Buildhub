/**
 * Mock Data Generators
 * Sample mock data for testing features
 */

import { TestDataFactory } from './testDataFactory';

/**
 * Base interface for all models
 */
interface BaseModel {
  id: number;
  title: string;
  subtitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Generic Mock Generators
// ============================================================================

/**
 * Generate a base model with common fields
 */
export function mockBaseModel(id?: number): BaseModel {
  const _id = id ?? TestDataFactory.randomInt(1, 1000);
  return {
    id: _id,
    title: `Item ${_id}`,
    subtitle: `Description for item ${_id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate array of base models
 */
export function mockBaseModelList(count: number = 10): BaseModel[] {
  return TestDataFactory.generateArray(count, (index) => mockBaseModel(index + 1));
}

// ============================================================================
// Equipment Mocks
// ============================================================================

export interface MockEquipment {
  id: number;
  title: string;
  subtitle: string;
  has_certificate: number;
  all_industries: number;
  industries: { id: number; title: string }[];
  parent_id: number | null;
  image: string;
  titles: string;
  equipment_type: { id: number; title: string } | null;
}

/**
 * Generate mock equipment
 */
export function mockEquipment(id?: number): MockEquipment {
  const _id = id ?? TestDataFactory.randomInt(1, 1000);
  const industries = [
    { id: 1, title: 'Manufacturing' },
    { id: 2, title: 'Construction' },
    { id: 3, title: 'Automotive' },
  ];

  return {
    id: _id,
    title: `Equipment ${_id}`,
    subtitle: `Equipment description ${_id}`,
    has_certificate: TestDataFactory.randomInt(0, 1),
    all_industries: TestDataFactory.randomInt(0, 1),
    industries: TestDataFactory.generateArray(
      TestDataFactory.randomInt(0, 3),
      () => TestDataFactory.randomItem(industries)!,
    ),
    parent_id: TestDataFactory.randomInt(0, 1) ? TestDataFactory.randomInt(1, 50) : null,
    image: `https://picsum.photos/200/200?random=${_id}`,
    titles: `Equipment ${_id} - Full Title`,
    equipment_type: TestDataFactory.randomInt(0, 1)
      ? { id: TestDataFactory.randomInt(1, 5), title: `Type ${TestDataFactory.randomInt(1, 5)}` }
      : null,
  };
}

/**
 * Generate array of mock equipment
 */
export function mockEquipmentList(count: number = 10): MockEquipment[] {
  return TestDataFactory.generateArray(count, (index) => mockEquipment(index + 1));
}

// ============================================================================
// User Mocks
// ============================================================================

export interface MockUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'active' | 'inactive';
}

/**
 * Generate mock user
 */
export function mockUser(id?: number): MockUser {
  const _id = id ?? TestDataFactory.randomInt(1, 1000);
  const roles = ['admin', 'manager', 'user', 'viewer'];

  return {
    id: _id,
    name: `User ${_id}`,
    email: `user${_id}@example.com`,
    avatar: `https://i.pravatar.cc/150?u=${_id}`,
    role: TestDataFactory.randomItem(roles)!,
    status: TestDataFactory.randomItem(['active', 'inactive'])!,
  };
}

/**
 * Generate array of mock users
 */
export function mockUserList(count: number = 10): MockUser[] {
  return TestDataFactory.generateArray(count, (index) => mockUser(index + 1));
}

// ============================================================================
// Product Mocks
// ============================================================================

export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  rating: number;
}

/**
 * Generate mock product
 */
export function mockProduct(id?: number): MockProduct {
  const _id = id ?? TestDataFactory.randomInt(1, 1000);
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home'];

  return {
    id: _id,
    name: `Product ${_id}`,
    description: `This is a detailed description for product ${_id}. It includes all the important features and specifications.`,
    price: TestDataFactory.randomInt(10, 1000),
    stock: TestDataFactory.randomInt(0, 100),
    category: TestDataFactory.randomItem(categories)!,
    image: `https://picsum.photos/400/300?random=${_id}`,
    rating: Math.round(Math.random() * 50) / 10,
  };
}

/**
 * Generate array of mock products
 */
export function mockProductList(count: number = 10): MockProduct[] {
  return TestDataFactory.generateArray(count, (index) => mockProduct(index + 1));
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * Wrap data in API response format
 */
export function wrapApiResponse<T>(data: T, message: string = 'Success') {
  return TestDataFactory.apiResponse(data, true, message);
}

/**
 * Wrap list data with pagination
 */
export function wrapPaginatedResponse<T>(data: T[], page: number = 1, perPage: number = 10) {
  return TestDataFactory.paginatedApiResponse(data, page, perPage);
}

// ============================================================================
// Static Test Data Sets
// ============================================================================

/**
 * Pre-generated static test data for deterministic testing
 */
export const STATIC_TEST_DATA = {
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '',
      role: 'admin',
      status: 'active' as const,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '',
      role: 'user',
      status: 'active' as const,
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatar: '',
      role: 'manager',
      status: 'inactive' as const,
    },
  ],

  products: [
    {
      id: 1,
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999,
      stock: 50,
      category: 'Electronics',
      image: '',
      rating: 4.5,
    },
    {
      id: 2,
      name: 'Headphones',
      description: 'Wireless headphones',
      price: 199,
      stock: 100,
      category: 'Electronics',
      image: '',
      rating: 4.2,
    },
    {
      id: 3,
      name: 'T-Shirt',
      description: 'Cotton t-shirt',
      price: 29,
      stock: 200,
      category: 'Clothing',
      image: '',
      rating: 4.0,
    },
  ],

  equipment: [
    {
      id: 1,
      title: 'Excavator',
      subtitle: 'Heavy duty',
      has_certificate: 1,
      all_industries: 0,
      industries: [{ id: 2, title: 'Construction' }],
      parent_id: null,
      image: '',
      titles: 'Excavator - Heavy',
      equipment_type: { id: 1, title: 'Heavy Machinery' },
    },
    {
      id: 2,
      title: 'Drill',
      subtitle: 'Power drill',
      has_certificate: 0,
      all_industries: 1,
      industries: [],
      parent_id: null,
      image: '',
      titles: 'Drill - Power',
      equipment_type: { id: 2, title: 'Power Tools' },
    },
  ],
};

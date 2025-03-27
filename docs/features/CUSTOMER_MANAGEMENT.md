# Customer Management

This document outlines the customer management functionality implemented in the Event Planner application.

## Overview

The customer management module provides a comprehensive set of features for managing customer data, including:

- Customer listing and search
- Customer creation with validation
- Customer details view
- Customer editing
- Customer deletion
- Mobile number formatting and validation

## Components and Files

### Service Layer

- **`src/utils/customer-service.ts`**: Contains all the customer-related data access functions
  - `getCustomers()`: Fetches all customers
  - `getCustomerById(id)`: Fetches a single customer by ID
  - `createCustomer(customer)`: Creates a new customer
  - `updateCustomer(id, customer)`: Updates an existing customer
  - `deleteCustomer(id)`: Deletes a customer
  - `searchCustomers(query)`: Searches customers by name or mobile number
  - `formatUKMobileNumber(phoneNumber)`: Formats phone numbers to UK standard
  - `isValidUKMobileNumber(phoneNumber)`: Validates UK mobile numbers

### UI Components

- **`src/components/customers/customer-list.tsx`**: Displays a list of customers with actions
- **`src/components/customers/customer-form.tsx`**: Form for creating and editing customers
- **`src/components/customers/customer-detail.tsx`**: Displays customer details
- **`src/components/customers/customer-search.tsx`**: Search interface for customers

### Pages

- **`src/app/(dashboard)/customers/page.tsx`**: Main customer listing page
- **`src/app/(dashboard)/customers/new/page.tsx`**: New customer creation page
- **`src/app/(dashboard)/customers/[id]/page.tsx`**: Customer details page
- **`src/app/(dashboard)/customers/[id]/edit/page.tsx`**: Customer editing page

## Database Schema

The customer data is stored in the `customers` table in Supabase with the following structure:

```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  mobile_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features

### Customer Listing

The main customers page displays a table of all customers with the following information:
- Full name
- Mobile number
- Notes
- Action buttons (View, Edit, Delete)

When there are no customers, a message is displayed encouraging the user to create a new customer.

### Customer Creation

New customer creation includes:
- A form with fields for first name, last name, mobile number, and notes
- Validation for required fields
- Validation for UK mobile number format
- Error handling for form submission failures
- Redirection to the customer list on successful creation

### Customer Details

The customer details page shows:
- Full name
- Mobile number with click-to-call functionality
- Notes
- Created date
- Edit button

### Customer Editing

Customer editing includes:
- A pre-filled form with the customer's information
- The same validation as customer creation
- Error handling for form submission failures
- Redirection to the customer details page on successful update

### Customer Deletion

Customer deletion includes:
- A confirmation dialog
- Error handling for deletion failures
- List refresh after successful deletion

### Mobile Number Validation

Mobile numbers are validated to ensure they match UK format:
- Starting with 07 (e.g., 07123456789)
- Or international format +447... (stored as 07...)
- Consistent formatting when saved to the database

### Customer Search

The customer search functionality allows:
- Searching by first name, last name, or mobile number
- Instant results as the user types
- Clearing the search to return to the full list

## Future Enhancements

Planned future enhancements to the customer management system include:

1. Bulk import of customers from CSV
2. Advanced filtering options
3. Sorting options for the customer list
4. Customer tagging/categorization
5. Customer activity history
6. Integration with event bookings
7. SMS notification preferences 

## Advanced Features

The following advanced features have been implemented:

### CSV Customer Import (Desktop Only)

The CSV import functionality allows for bulk importing of customer data from CSV files. Key features include:

- User-friendly import interface with file selection
- Preview of data before importing
- Validation of required fields and mobile number format
- Detection of duplicate mobile numbers
- Detailed error reporting
- Batch processing for large imports
- Import status and results summary

#### CSV Format Requirements

CSV files should have the following columns:
- `first_name` (required)
- `last_name`
- `mobile_number` (required, must be a valid UK format)
- `notes`

The system supports various CSV formats, including quoted values, and standardizes mobile numbers during import.

### Enhanced Search Functionality

The search system has been enhanced with the following features:

- Debounced search to reduce API calls
- Ability to filter by search type (all fields, name only, mobile number only)
- Improved UI with clear indicators of search status
- Option to clear search with a single click
- Mobile-responsive design
- Increased result limit (50 results)

### Mobile Number Standardization

All mobile numbers are standardized during import and creation to ensure consistency:
- Removing spaces, dashes, and other non-numeric characters
- Converting international format (+44) to UK local format (07)
- Validating against UK mobile number patterns 
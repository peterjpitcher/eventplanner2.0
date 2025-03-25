## Customer Management

### CSV Import Feature

The application includes a CSV import feature for customers, allowing administrators to bulk import customer data. Design decisions include:

1. **CSV Format**: We've defined a simple CSV format with the minimum required customer fields:
   - first_name (required)
   - last_name (required)
   - mobile_number (required, must be a valid UK mobile)
   - notes (optional)

2. **User Interface Flow**:
   - Upload interface with clear instructions and a downloadable template
   - Preview of data before confirmation
   - Detailed error reporting for invalid records
   - Success/failure summary after import

3. **Error Handling**:
   - Validation of CSV structure (headers, required fields)
   - Per-row validation with specific error messages
   - Categorized errors (format errors vs. validation errors)
   - Prevention of duplicate mobile numbers

4. **Implementation Approach**:
   - Client-side parsing for immediate feedback
   - Separate validation from insertion logic
   - Batch processing with partial success reporting

This allows administrators to efficiently add multiple customers to the system while maintaining data integrity and providing clear feedback on any issues encountered during the import process. 
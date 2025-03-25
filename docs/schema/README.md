# Database Schema Documentation

This directory contains documentation related to the database schema for the Event Planner application.

## Overview

The Event Planner application uses a PostgreSQL database via Supabase for data storage. The schema includes tables for customers, events, bookings, and SMS functionality.

## Schema Diagram

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│   customers    │       │     events     │       │event_categories │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id             │       │ id             │       │ id             │
│ first_name     │       │ name           │╱──────┤ name           │
│ last_name      │       │ description    │       │ default_capacity│
│ mobile_number  │       │ category_id    │╲──────┤ default_start_time
│ notes          │       │ capacity       │       │ notes          │
│ created_at     │       │ start_time     │       │ created_at     │
└────────────────┘       │ notes          │       └────────────────┘
       │                 │ is_published   │
       │                 │ is_canceled    │
       │                 │ created_at     │
       │                 │ updated_at     │
       │                 └────────────────┘
       │                         │
       │                         │
┌──────┴────────┐       ┌───────┴────────┐
│   bookings    │       │  sms_messages  │
├───────────────┤       ├────────────────┤
│ id            │╱──────┤ id             │
│ customer_id   │╲──────┤ customer_id    │
│ event_id      │       │ booking_id     │
│ seats_or_reminder     │ message_type   │
│ notes         │       │ message_content│
│ created_at    │       │ sent_at        │
└───────────────┘       │ status         │
       ▲                │ message_sid    │
       │                └────────────────┘
       │
┌──────┴────────┐
│  sms_replies  │
├───────────────┤
│ id            │
│ customer_id   │
│ from_number   │
│ message_content│
│ received_at   │
│ read          │
└───────────────┘
```

## View Definition

The system also includes a view called `events_view` that provides a bridge between the events table structure and the application interfaces. This view maps database fields to the expected format in the application code.

## Detailed Documentation

For full documentation on the database schema, see [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) in the root documentation directory. 
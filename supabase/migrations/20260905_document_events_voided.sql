-- Allow voided documents to be recorded in the audit trail.
alter table public.document_events
  drop constraint if exists document_events_event_type_check;

alter table public.document_events
  add constraint document_events_event_type_check
  check (
    event_type in (
      'created',
      'sent',
      'viewed',
      'signed',
      'status_changed',
      'voided'
    )
  );

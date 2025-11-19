/**
 * Tracks which UFC events have been processed to avoid duplicates
 * and enable incremental historical data collection
 */

export interface ProcessedEvents {
  lastProcessedEventId: string;
  lastProcessedDate: string;
  processedEventIds: Set<string>;
  totalEventsProcessed: number;
}

const PROCESSED_EVENTS_FILE = 'processed-events.json';

export function loadProcessedEvents(): ProcessedEvents {
  // Implementation will read from data/processed-events.json
  return {
    lastProcessedEventId: '',
    lastProcessedDate: '',
    processedEventIds: new Set(),
    totalEventsProcessed: 0
  };
}

export function saveProcessedEvents(data: ProcessedEvents): void {
  // Implementation will save to data/processed-events.json
}

/**
 * Generated by orval v6.5.3 🍺
 * Do not edit manually.
 * API Кинотеатр "Искорка"
 * API Кинотеатр "Искорка"
 * OpenAPI spec version: 1.0.0
 */
import type { Seats } from './seats';

export type FreeSpaceResponseItem = {
  idSession?: number;
  idAuditorium?: number;
  placeNumber?: number;
  placeStatus?: string;
  seatsInfo?: Seats;
};

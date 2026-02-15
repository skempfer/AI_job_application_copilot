/**
 * UI Mapping Layer
 *
 * Responsible for converting raw API responses into UI-ready models.
 * Separates business logic from component rendering.
 */

export { mapAlignmentResponseToUIModel, mapWithDefaults } from './alignmentMapper';
export type { AlignmentUIModel } from '../../types/analysis';

/**
 * Education Classification Module - Main Exports
 */

// Models
export { default as EducationClassificationModel } from './core/models/education.classification.model';

// Params
export { default as AddEducationClassificationParams } from './core/params/add.educationClassification.params';
export { default as EditEducationClassificationParams } from './core/params/edit.educationClassification.params';

// Repository
export { default as EducationClassificationRepository } from './data/repositories/educationClassification.repository';

// Controller
export { default as EducationClassificationController } from './presentation/controllers/educationClassification.controller';

// API Service
export { default as EducationClassificationApiService } from './data/api/educationClassification.api-service';

import BaseRepository, { type RepositoryConfig } from '@/base/Domain/Repositories/baseRepository';

import DocumentModel from '../../core/models/document.model';
import DocumentApiService from '../api/document.api-service';
import DocumentShowModel from '../../core/models/document.show.model';

export default class DocumentRepository extends BaseRepository<
  DocumentShowModel,
  DocumentModel[]
> {
  private static instance: DocumentRepository;

  protected get apiService() {
    return DocumentApiService.getInstance();
  }

  protected get config(): RepositoryConfig {
    return {
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    };
  }

  protected get mockItem(): DocumentShowModel {
    return DocumentShowModel.example;
  }

  protected get mockList(): DocumentModel[] {
    return [{...DocumentModel.example , id:1 , title:'b'}, { ...DocumentModel.example,id:2 , title:'a' }];
  }


  static getInstance(): DocumentRepository {
    if (!DocumentRepository.instance) {
      DocumentRepository.instance = new DocumentRepository();
    }
    return DocumentRepository.instance;
  }

  protected parseItem(data: any): DocumentShowModel {
    return DocumentShowModel.fromJson(data);
  }

  protected parseList(data: any): DocumentModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => DocumentModel.fromJson(item));
  }
}
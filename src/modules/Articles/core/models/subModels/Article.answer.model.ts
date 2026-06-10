import ArticleImage from '@/assets/images/image 22.png';
export default class ArticleAnswerModel {
  public readonly id?: number;
  public readonly answer?: string;
  public readonly image?: string;
  public readonly countCorrect?: number;
  public readonly countStudent?: number;


  constructor(data: { id?: number; answer?: string; image?: string, countCorrect: number, countStudent: number }) {
    this.id = data.id;
    this.answer = data.answer || '';
    this.image = data.image || '';
    this.countCorrect = data.countCorrect ;
    this.countStudent = data.countStudent ;
    Object.freeze(this);
  }

  static fromJson(json: any): ArticleAnswerModel {
    if (!json) {
      throw new Error('Cannot create ArticleAnswerModel from null or undefined');
    }

    return new ArticleAnswerModel({
      id: json.id,
      answer: json.answer,
      image: json.image,
      countCorrect: json.countCorrect,
      countStudent: json.countStudent,
    });
  }

  static examples: ArticleAnswerModel[] = [
  new ArticleAnswerModel({
    id: 1,
    answer: 'Cairo',
    image: ArticleImage,
    countCorrect: 10,
    countStudent: 20,
  }),
  new ArticleAnswerModel({
    id: 2,
    answer: 'Alexandria',
    image: ArticleImage,
    countCorrect: 25,
    countStudent: 40,
  }),
  new ArticleAnswerModel({
    id: 3,
    answer: 'Mansoura',
    image: ArticleImage,
    countCorrect: 65,
    countStudent: 90,
  }),
];
}

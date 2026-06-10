import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import QuestionCard from '../QuestionCard.vue';
import ArticleCardModel from '../../../../core/models/article.card';
import { ArticleDifficultyEnum } from '../../../../core/constant/Article.difficulty.enum';
import { ArticleTypeEnum } from '../../../../core/constant/Article.type.enum';
import ArticleAnswerModel from '../../../../core/models/subModels/Article.answer.model';

const mockQuestions = [
  new ArticleCardModel({
    id: 1,
    title: 'Question 1',
    createdAt: '2026-05-31',
    questions: 'Which of the following is correct?',
    articledifficulty: ArticleDifficultyEnum.easy,
    status: ArticleTypeEnum.mcq,
    answer: [
      new ArticleAnswerModel({
        id: 1,
        answer: 'Correct Answer',
        image: 'img1.png',
        countCorrect: 95,
        countStudent: 100,
      }),
      new ArticleAnswerModel({
        id: 2,
        answer: 'Incorrect Answer',
        image: 'img2.png',
        countCorrect: 5,
        countStudent: 100,
      }),
    ],
  }),
  new ArticleCardModel({
    id: 2,
    title: 'Question 2',
    createdAt: '2026-05-31',
    questions: 'True or False question?',
    articledifficulty: ArticleDifficultyEnum.hard,
    status: ArticleTypeEnum.true_false,
    answer: [],
  }),
];

describe('QuestionCard.vue', () => {
  it('renders correctly with given questions', () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: mockQuestions,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findAll('.num-question')).toHaveLength(2);
  });

  it('displays correct question texts and indices', () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: mockQuestions,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    const headers = wrapper.findAll('.header-card h6');
    expect(headers[0].text()).toContain('questions 1');
    expect(headers[1].text()).toContain('questions 2');

    const texts = wrapper.findAll('.question_text p');
    expect(texts[0].text()).toBe('Which of the following is correct?');
    expect(texts[1].text()).toBe('True or False question?');
  });

  it('applies correct CSS classes for difficulty and status/type', () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: mockQuestions,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    const difficultySpans = wrapper.findAll('.type .value');
    expect(difficultySpans[0].classes()).toContain('easy');
    expect(difficultySpans[0].text()).toBe('easy');
    expect(difficultySpans[1].classes()).toContain('hard');
    expect(difficultySpans[1].text()).toBe('hard');

    const statusSpans = wrapper.findAll('.type .value-status');
    expect(statusSpans[0].classes()).toContain('mcq');
    expect(statusSpans[0].text()).toBe('mcq');
    expect(statusSpans[1].classes()).toContain('true_false');
    expect(statusSpans[1].text()).toBe('true_false');
  });

  it('renders answer options correctly', () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: mockQuestions,
      },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    const answers = wrapper.findAll('.answer');
    expect(answers).toHaveLength(2); // From the first question

    expect(answers[0].find('.answer_text').text()).toBe('Correct Answer');
    expect(answers[0].find('.corret').text()).toBe('95%');
    expect(answers[0].find('.student').text()).toBe('100 stds');

    expect(answers[1].find('.answer_text').text()).toBe('Incorrect Answer');
    expect(answers[1].find('.corret').text()).toBe('5%');
    expect(answers[1].find('.student').text()).toBe('100 stds');
  });
});

<script setup lang="ts">
import FolderCrudIcon from '@/shared/icons/FolderCrudIcon.vue';
import { useRoute } from 'vue-router';
import CopyIcon from '@/shared/icons/CopyIcon.vue';
import ArticlePencil from '@/shared/icons/ArticlePencil.vue';
import Articlearrow from '@/shared/icons/articlearrow.vue';
import AchiveIcon from '@/shared/icons/AchiveIcon.vue';
import DeletIArticle from '@/shared/icons/DeletIArticle.vue';
import DeleteDialog from '@/shared/HelpersComponents/dialog/DeleteDialog.vue';
import DeleteArticlesParams from '@/modules/Articles/core/params/delet.Articles.params';
import ArticleController from '../../controllers/Article.controller';
import { useRouter } from 'vue-router';
import Articlesubject from '@/shared/icons/articlesubject.vue';
import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';

const router = useRouter();
const { artical } = defineProps<{
    artical: ShowQuestionsModel;
}>();

const route = useRoute();

const controller = ArticleController.getInstance();
const deleteArticle = async (id: number) => {
    await controller.delete(new DeleteArticlesParams(id));
    router.push(`/${route.params.country_code}/articles`);
};
// delet arrow from article subject and show only title 
// const deleteArrow = (subject: ArticleSubjectModel) => {
//   const subjects = subject?.full_title?.split(/\s*->\s*/g);
//   return subjects?.map((subject) => subject.trim());
// }
const getSubjectPath = (item: ShowQuestionsModel) => {
  if (!item?.subjectTree) return '';
  const parts = item.subjectTree.full_title?.split(/\s*->\s*/);
  return parts?.map((subject) => subject.trim()) ?? '';
};
</script>
<template>
    <div class="All_over_view">
        <header class="form-header">
            <div class="header-text">
                <FolderCrudIcon />
                <h6>{{ $t('artical_details') }}</h6>
            </div>
            <div class="buttons">

                <router-link :to="`/articles/edit/${route.params.id}`" title="edit" class="btn btn-edit">
                    <ArticlePencil />
                    {{ $t('Edit') }}
                </router-link>
                <div class="btn btn-action">
                    <AchiveIcon />
                    {{ $t('Archive ') }}
                </div>

                <DeleteDialog @delete="deleteArticle(artical.id!)">
                    <template #Dialog>
                        <button class="btn-delet" title="Delete">
                            <DeletIArticle />
                        </button>
                    </template>
                </DeleteDialog>
                <!-- <router-link
:to="`/${route.params.country_code}/articles/edit/${route.params.id}`" title="edit"
                    class=" btn-delet">
                    <DeletIArticle />
                </router-link> -->
            </div>
        </header>
        <div class="cards_details">
            <div class="card_one">
                <div class="details">
                    <div class="head">
                        <h6>{{ $t('id') }} :</h6>
                        <p>{{ artical?.question_id }}</p>
                    </div>
                    <div class="head">
                        <h6>{{ $t('created_at') }} : </h6>
                        <p>{{ artical?.created_at }}</p>
                    </div>
                    <div class="head">
                        <h6>{{ $t('Created by') }} : </h6>
                        <p>{{ artical?.created_by?.title }}</p>
                    </div>
                </div>
                <div class="head">
                    <h5 class="title">{{ artical?.question }}</h5>
                </div>
                <div class="head">
                    <p class="description">{{ artical?.question_description || $t('N/A') }}</p>
                </div>
                <div class="head">
                    <h6 class="question">
                        <CopyIcon /> {{ $t('number of questions ') }} :
                    </h6>
                    <p class="number_of_questions">{{ artical?.number_of_questions }}</p>
                </div>
            </div>
            <div class="card_two ">
                <div class="title">
                    <h6>{{ $t('Subjects') }} :</h6>
                </div>
                <div class="Subjects"  >
                    <div class="contant">
                        <!-- {{ deleteArrow(artical?.subject)}} -->
                        <!-- {{ deleteArrow(artical?.subject)}} -->
                        <div v-for="(subject, index) in getSubjectPath(artical)" :key="index" class="govermental" >
                            <p>{{ subject }}</p> 
                            <Articlearrow  v-if="index < getSubjectPath(artical).length - 1" class="arrow-icon" />
                        </div>
                        <!-- <div class="govermental">
                            <p>{{ artical?.subject.title }}</p>
                            <Articlearrow class="arrow-icon" />
                        </div> -->
                        <!-- <div class="govermental">
                            <p>{{ artical?.subject.title }}</p>
                        </div> -->
                    </div>
                    <div class="arrow"><Articlesubject /> </div>
                    <div class="sub_subject"><p>{{ artical?.e_c_subject?.title }}</p></div>
                </div>
                <div class="source">
                    <div class="title">
                        <h6>{{ $t('artical source') }}</h6>
                    </div>
                    <div class="artical_document">
                        <h6>{{ $t('Documents') }} :</h6>
                        <div v-for="(doc, index) in artical?.document" :key="index">
                            <p>
                            {{doc?.document_title}}
                            </p>
                            <Articlearrow class="arrow-icon" />
                        </div>
                    </div>
                    <div class="artical_document">
                        <h6>{{ $t('Source') }} :</h6>
                        <div v-for="(doc, index) in artical?.document" :key="index">
                            <p >{{doc?.text}}</p>
                            <!-- <Articlearrow class="arrow-icon" /> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../../../../../styles/variables' as *;
@use '../../../../../styles/mixins/flex' as *;
.btn-edit {
      background: white;
      border: 1px solid var(--primary-green);
      color: var(--primary-green);
      border-radius: $XlSize4;
      &:hover {
        background-color: var(--primary-green) !important;
        color: white !important;

        :deep(svg) {
          color: white;
        }

        :deep(path) {
          stroke: white;
        }
      }
    }
</style>
<script setup lang="ts">
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';

  defineProps<{
    logs: {
      date: string;
      status: string;
      time: string;
      createdBy: string;
    }[];
  }>();

  const getStatusClass = (status: string) => {
    const value = status.toLowerCase();

    return {
      waiting: value.includes('waiting'),

      drafting: value.includes('draft') || value.includes('created') || value.includes('added'),

      rejected: value.includes('reject'),

      approved: value.includes('approve'),
    };
  };
</script>

<template>
  <div class="question-log-history">
    <Accordion value="0">
      <AccordionPanel value="0">
        <!-- MAIN HEADER -->
        <AccordionHeader class="card-header">
          <h3>Log History</h3>
        </AccordionHeader>

        <!-- CONTENT -->
        <AccordionContent>
          <div class="logs">
            <div v-for="log in logs" :key="`${log.date}-${log.time}`" class="log-item">
              <div class="log-date" :class="getStatusClass(log.status)">
                {{ log.date }}
              </div>

              <div class="log-content">
                <div class="top">
                  <h4 :class="getStatusClass(log.status)">
                    {{ log.status }}
                  </h4>

                  <span> At {{ log.time }} </span>
                </div>

                <p>
                  Created By:
                  <span class="created-by-name">
                    {{ log.createdBy }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

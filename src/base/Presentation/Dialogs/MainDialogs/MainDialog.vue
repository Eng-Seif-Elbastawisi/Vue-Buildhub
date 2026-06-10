<script lang="ts" setup>
  const close = () => {
    // console.log('close')
    (document.querySelector('.dialog') as HTMLDialogElement)?.close();
  };

  // Automatically close the dialog after 3 seconds once it's opened
  // const autoCloseDialog = () => {
  //   const dialog = document.querySelector<HTMLDialogElement>(".dialog");
  //   if (dialog) {
  //     dialog.showModal(); // Ensure the dialog is opened before closing
  //     setTimeout(() => {
  //       dialog.close();
  //     }, 5000);
  //   }
  // };
  //
  // onMounted(() => {
  //   autoCloseDialog();
  // });
</script>

<template>
  <dialog class="dialog" @click.self="close">
    <div class="dialog-container">
      <img alt="" class="dialog-icon" src="" />
      <h4 class="dialog-title"></h4>
      <p class="dialog-message"></p>
      <!--      <button class="dialog-close-btn">Ok</button>-->
    </div>
  </dialog>
</template>

<style scoped></style>

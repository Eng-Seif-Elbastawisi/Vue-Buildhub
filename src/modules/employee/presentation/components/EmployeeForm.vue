<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import type EmployeeModel from '../../core/models/employee.model';
  import AddEmployeeParams from '../../core/params/add.employee.params';
  import EditEmployeeParams from '../../core/params/edit.employee.params';
  import EmployeeIcon from '@/shared/icons/EmployeeIcon.vue';
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UplaodImageInput from '@/shared/icons/UploadImage/UplaodImageInput.vue';
  import InputSwitch from 'primevue/inputswitch';
  import RadioButton from 'primevue/radiobutton';
  import { GenderENum } from '../../core/constant/gender.enum';
  import { EmployeeStatusEnm } from '../../core/constant/employee.status.enum';

  const emit = defineEmits(['updateData']);

  const { employee, formKey, loading } = defineProps<{
    employee?: EmployeeModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const FormStore = useFormsStore();
  onBeforeRouteLeave((to, from) => {
    const savedData = FormStore.getFormData(formKey!);
    if (savedData && to.path !== from.path) {
      FormStore.showReturnWarning(formKey!);
    }
  });

  // Form state
  const name = ref<string>('');
  const email = ref<string>('');
  const phone = ref<string>('');
  const password = ref<string>('');
  const image = ref<string>('');
  const isSuperadmin = ref<boolean>(false);
  const role_id = ref<number>(1);
  const employeeType = ref<number>(1);
  const gender = ref<GenderENum>();
  const lastName = ref<string>('');
  const employeeId = ref('');
  const UploadedImage = ref<string[]>([]);
  const checked = ref(false); //employee status

  watch(
    () => employee,
    (newEmployee) => {
      if (newEmployee) {
        name.value = newEmployee.firstname;
        email.value = newEmployee.email;
        phone.value = newEmployee.phone;
        image.value = newEmployee.image;
        isSuperadmin.value = newEmployee.isSuperadmin;
        employeeType.value = newEmployee.status;
        gender.value = newEmployee.gender;
        lastName.value = newEmployee.lastname;
        employeeId.value = newEmployee.employeeId;
        // Password is not populated for security/editing purposes
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  const updateData = () => {
    const data = {
      email: email.value,
      EmployeeRef: employeeId.value,
      firstname: name.value,
      gender: gender.value == 1 ? GenderENum.male : GenderENum.female,
      image: String(UploadedImage.value),
      lastname: lastName.value,
      phone: phone.value,
      employeeStatus: checked.value ? EmployeeStatusEnm.active : EmployeeStatusEnm.disavtive,
      password: password.value,
    };

    FormStore.setFormData(formKey!, data);

    let params: any;
    if (route.params.id) {
      params = new EditEmployeeParams({
        id: Number(route.params.id),
        ...data,
      });
    } else {
      params = new AddEmployeeParams(data);
    }
    emit('updateData', params);
  };

  const resetForm = () => {
    name.value = '';
    email.value = '';
    phone.value = '';
    password.value = '';
    image.value = '';
    isSuperadmin.value = false;
    role_id.value = 1;
    employeeType.value = 1;
    gender.value = 1;
    lastName.value = '';
    employeeId.value = '';
  };

  onMounted(() => {
    const saved = FormStore.getFormData(formKey!);
    if (saved) {
      name.value = saved.name;
      email.value = saved.email;
      phone.value = saved.phone;
      password.value = saved.password;
      image.value = saved.image;
      isSuperadmin.value = saved.isSuperadmin;
      role_id.value = saved.role_id;
      employeeType.value = saved.employeeType;
      gender.value = saved.gender;
      lastName.value = saved.lastName;
      employeeId.value = saved.employeeId;
      updateData();
    } else if (!employee) {
      resetForm();
    }
  });

  const handleImageChange = (file: any) => {
    UploadedImage.value = file[0]?.base64;
    updateData();
  };
</script>

<template>
  <div class="employee-details-form-card">
    <header class="form-header">
      <div class="form-title">
        <div class="header-text">
          <h3>{{ route.params.id ? 'Edit Employee' : 'Add New Employee' }}</h3>
          <p class="header-subtitle">
            {{
              route.params.id
                ? 'Update the employee details below'
                : 'Fill in the required information to add a new employee'
            }}
          </p>
        </div>
        <div class="employee-status">
          <div class="title">
            <h6>Employee Status</h6>
            <p :class="checked ? `` : `warn`">{{ checked ? $t('active') : $t('disactive') }}</p>
          </div>
          <div class="switch">
            <InputSwitch v-model="checked" @change="updateData" />
          </div>
        </div>
      </div>
      <span v-if="route.params.id" class="edit-badge">Editing</span>
    </header>

    <div class="employee-details-form">
      <p><EmployeeIcon /> {{ $t(`Basic Info`) }}</p>
      <h6 @click="resetForm">{{ $t(`reset`) }}</h6>
    </div>

    <div class="form-fields">
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="name">{{ $t(`First Name`) }}</label>
        <div class="input-wrap">
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter first name"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="name">{{ $t(`Last Name`) }}</label>
        <div class="input-wrap">
          <input
            id="name"
            v-model="lastName"
            type="text"
            placeholder="Enter last name"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="password">{{ $t(`password`) }}</label>
        <div class="input-wrap">
          <input
            id="password"
            v-model="password"
            type="text"
            placeholder="Enter Password"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group col-span-1" :class="{ disabled: loading }">
        <label class="field-label" for="email">{{ $t(`Email`) }}</label>
        <div class="input-wrap">
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="enter your email"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="employeeId">{{ $t('employee_ref_number') }}</label>
        <div class="input-wrap">
          <input
            id="employeeId"
            v-model="employeeId"
            type="tel"
            placeholder="Enter Employee Ref Number"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="phone">{{ $t(`Phone`) }}</label>
        <div class="input-wrap">
          <input
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="Enter phone number"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="phone">{{ $t(`Gender`) }}</label>

        <div class="gender-group">
          <div class="input-field">
            <RadioButton v-model="gender" input-id="male" name="gender" :value="GenderENum.male" />
            <label for="male">{{ $t('male') }}</label>
          </div>

          <div class="input-field">
            <RadioButton
              v-model="gender"
              input-id="female"
              name="gender"
              :value="GenderENum.female"
            />
            <label for="female">{{ $t('female') }}</label>
          </div>
        </div>
      </div>

      <div class="field-group col-span-2" :class="{ disabled: loading }">
        <HandleFilesUpload
          :label="`upload image`"
          accept="image/*"
          :multiple="false"
          :index="1"
          :file="UploadedImage"
          :have-content="true"
          :class="`image-input`"
          @change="handleImageChange"
        >
          <template #content>
            <div class="add-imaegs-data">
              <UplaodImageInput />
              <p class="first-text"><span>Click to upload</span>or drag and drop</p>
              <p class="second-text">JPG, JPEG, PNG less than 1MB</p>
            </div>
          </template>
        </HandleFilesUpload>
      </div>
    </div>
  </div>
</template>

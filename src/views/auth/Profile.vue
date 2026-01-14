<script setup>
import PersonalInformationForm from '@/components/auth/PersonalInformationForm.vue';
import PreferencesForm from '@/components/auth/PreferencesForm.vue';
import LogoutOtherSessionsForm from '@/components/auth/LogoutOtherSessionsForm.vue';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue';
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="card">
            <PersonalInformationForm />
        </div>
        <div class="card">
            <PreferencesForm />
        </div>
        <div class="card">
            <ChangePasswordForm />
        </div>
        <div class="card">
            <LogoutOtherSessionsForm />
        </div>
    </div>
</template>

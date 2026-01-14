<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AuthLogoWidget from '@/components/auth/AuthLogoWidget.vue';
import { Form } from '@primevue/forms';
import { AuthService } from '@/service/AuthService';

const authStore = useAuthStore();

const toggleRemember = () => {
    authStore.toggleRememberMe();
};

const initialValues = ref({
    email: authStore.remember?.email ?? '',
    password: '',
    remember: authStore.rememberMe
});

const loading = ref(false);

const submit = async ({ valid, states }) => {
    if (!valid) {
        return;
    }

    loading.value = true;

    try {
        const response = await AuthService.login(states.email.value, states.password.value);

        authStore.login({
            ...response.data
        });
    } catch {
        // empty catch
    }

    loading.value = false;
};
</script>

<template>
    <section class="animate-fadein animate-duration-300 animate-ease-in relative lg:pb-14 lg:py-52 py-36">
        <div class="landing-container mx-auto relative z-10 px-12">
            <div class="relative mt-28 max-w-[46rem] mx-auto">
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[4deg] lg:rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <div
                    class="w-full h-full inset-0 bg-white/64 dark:bg-surface-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] lg:-rotate-[7deg] backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)] dark:shadow-sm"
                />
                <Form
                    v-slot="$form"
                    :initialValues
                    @submit="submit"
                    class="space-y-8 p-8 relative z-10 bg-white/64 dark:bg-surface-800 backdrop-blur-[90px] rounded-3xl shadow-[0px_87px_24px_0px_rgba(120,149,206,0.00),0px_56px_22px_0px_rgba(120,149,206,0.01),0px_31px_19px_0px_rgba(120,149,206,0.03),0px_14px_14px_0px_rgba(120,149,206,0.04),0px_3px_8px_0px_rgba(120,149,206,0.06)]"
                >
                    <div class="pt-8 pb-8">
                        <div class="flex items-center justify-center">
                            <AuthLogoWidget />
                        </div>
                        <h1 class="text-4xl lg:text-6xl font-semibold text-surface-950 dark:text-surface-0 text-center">Login</h1>
                        <p class="text-center lg:text-xl text-surface-500 dark:text-white/64 mt-6 max-w-sm mx-auto">Enter your username and password to access your account.</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="h-px w-full bg-primary-500/10" />
                        <span class="text-surface-400">or</span>
                        <span class="h-px w-full bg-primary-500/10" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="email" class="font-medium text-surface-500 dark:text-white/64">Email Address</label>
                        <InputText id="email" name="email" class="w-full" />
                        <template v-if="$form.email?.invalid">
                            <Message v-for="error of $form.email.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="password" class="font-medium text-surface-500 dark:text-white/64">Password</label>
                        <Password inputId="password" name="password" toggleMask :feedback="false" fluid />
                        <template v-if="$form.password?.invalid">
                            <Message v-for="error of $form.password.errors" :key="error" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                        </template>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Checkbox inputId="remember" name="remember" binary @change="toggleRemember" />
                            <label for="remember" class="text-surface-500 dark:text-white/64">Remember me</label>
                        </div>
                        <router-link to="/forgot-password" class="font-semibold text-primary">Forgot password?</router-link>
                    </div>
                    <Button type="submit" class="w-full" rounded :disabled="loading ? '' : null">Login</Button>
                </Form>
            </div>
        </div>
    </section>
</template>

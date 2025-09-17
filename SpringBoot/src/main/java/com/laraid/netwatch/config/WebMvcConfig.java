package com.laraid.netwatch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean(name = "mvcTaskExecutor")
    public ThreadPoolTaskExecutor mvcTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);       // threads always kept alive
        executor.setMaxPoolSize(50);        // max threads
        executor.setQueueCapacity(100);     // queue before making new threads
        executor.setThreadNamePrefix("mvc-async-");
        executor.initialize();
        return executor; // implements AsyncTaskExecutor
    }


    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setTaskExecutor(mvcTaskExecutor());
        configurer.setDefaultTimeout(30000); // 30 sec timeout
    }
}



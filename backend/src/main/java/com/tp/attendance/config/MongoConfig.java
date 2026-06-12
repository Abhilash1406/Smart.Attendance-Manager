package com.tp.attendance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Remove the _class field that Spring Data MongoDB adds by default.
     * Keeps the documents clean and portable.
     */
    @Bean
    public MongoTemplate mongoTemplate(
            MongoDatabaseFactory factory,
            MappingMongoConverter converter) {

        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(factory, converter);
    }

    /**
     * Transaction manager — useful for multi-document operations in Phase 4+
     * Requires MongoDB replica set (can be single-node replica set in dev).
     */
    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }
}

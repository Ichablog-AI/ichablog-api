import { ArticleEntity } from '@be/entities/ArticleEntity';
import { UserEntity } from '@be/entities/UserEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    type Relation,
    UpdateDateColumn,
} from 'typeorm';

@Entity('blog_domains')
export class BlogDomainEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 255 })
    domain: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    logoKey?: string | null; // MinIO object key for logo

    @Column({ type: 'varchar', length: 255, nullable: true })
    faviconKey?: string | null; // MinIO object key for favicon

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(
        () => UserEntity,
        (user) => user.blogDomains
    )
    collaborators: Relation<UserEntity[]>;

    @OneToMany(
        () => ArticleEntity,
        (article) => article.blogDomain
    )
    articles: Relation<ArticleEntity[]>;
}

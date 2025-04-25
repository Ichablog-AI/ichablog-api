import { AppEntity } from '@be/database/AppEntity';
import { ArchivedSlugEntity } from '@be/entities/ArchivedSlugEntity';
import { BlogDomainEntity } from '@be/entities/BlogDomainEntity';
import { CategoryEntity } from '@be/entities/CategoryEntity';
import { CommentEntity } from '@be/entities/CommentEntity';
import { TagEntity } from '@be/entities/TagEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    type Relation,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

@Entity('articles')
export class ArticleEntity extends AppEntity {
    @Index()
    @Column({ length: 255 })
    title: string;

    @Index({ unique: true })
    @Column({ length: 255 })
    slug: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    featuredImageKey?: string | null; // MinIO object key

    @Column({ default: 'draft' }) // e.g., 'draft', 'published', 'archived'
    status: string;

    @Column({ nullable: true })
    publishedAt?: Date | null;

    @VersionColumn()
    version: number;

    // --- Relations ---
    @ManyToOne(
        () => BlogDomainEntity,
        (domain) => domain.articles,
        {
            onDelete: 'CASCADE',
            nullable: false,
        }
    )
    blogDomain: Relation<BlogDomainEntity>;

    @OneToMany(
        () => CommentEntity,
        (comment) => comment.article
    )
    comments: Relation<CommentEntity[]>;

    @OneToMany(
        () => ArchivedSlugEntity,
        (slug) => slug.article
    )
    archivedSlugs: Relation<ArchivedSlugEntity[]>;

    @ManyToMany(
        () => TagEntity,
        (tag) => tag.articles
    )
    @JoinTable({
        name: 'article_tags',
        joinColumn: { name: 'articleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags: Relation<TagEntity[]>;

    @ManyToMany(
        () => CategoryEntity,
        (category) => category.articles
    )
    @JoinTable({
        name: 'article_categories',
        joinColumn: { name: 'articleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    })
    categories: Relation<CategoryEntity[]>;
}

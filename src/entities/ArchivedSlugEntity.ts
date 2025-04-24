import { AppEntity } from '@be/database/AppEntity';
import { ArticleEntity } from '@be/entities/ArticleEntity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
// Import TagEntity and CategoryEntity if needed for foreign key constraint,
// but TypeORM doesn't directly support polymorphic relations via decorators easily.
// We'll use foreignEntityId and type column for logic.

@Entity('archived_slugs')
@Index(['type', 'foreignEntityId']) // Index for querying by entity
export class ArchivedSlugEntity extends AppEntity {
    @Index()
    @Column({ length: 255 })
    slug: string;

    @Column({ length: 50 }) // e.g., 'article', 'category', 'tag'
    type: string;

    @Column()
    foreignEntityId: number; // ID of the related entity (Article, Category, Tag)

    @CreateDateColumn()
    archivedAt: Date;

    // --- Relations (Conceptual) ---
    // We link specifically to ArticleEntity for cases where type is 'article'
    // For 'category' or 'tag', this relation will be null.
    @ManyToOne(
        () => ArticleEntity,
        (article) => article.archivedSlugs,
        {
            onDelete: 'CASCADE',
            nullable: true, // Allow null because it might be for a Category or Tag
        }
    )
    article?: Relation<ArticleEntity | null>;

    // Note: TypeORM doesn't have built-in polymorphic relations via decorators.
    // You would typically handle fetching the correct related entity (Category/Tag)
    // in your service layer based on the 'type' and 'foreignEntityId'.
}

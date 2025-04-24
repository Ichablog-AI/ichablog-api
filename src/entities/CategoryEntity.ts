import { ArticleEntity } from '@be/entities/ArticleEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToMany,
    PrimaryGeneratedColumn,
    type Relation,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
@Tree('materialized-path')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ length: 255 })
    name: string;

    @Index({ unique: true })
    @Column({ length: 255 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @TreeChildren()
    children: Relation<CategoryEntity[]>;

    @TreeParent({ onDelete: 'SET NULL' })
    parent?: Relation<CategoryEntity | null>;

    @ManyToMany(
        () => ArticleEntity,
        (article) => article.categories
    )
    articles: Relation<ArticleEntity[]>;
}

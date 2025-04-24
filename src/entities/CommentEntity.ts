import { ArticleEntity } from '@be/entities/ArticleEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
@Tree('materialized-path')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ length: 255 })
    authorName: string;

    @Column({ length: 255, nullable: true })
    authorEmail?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    authorUrl?: string | null;

    @Column({ default: 'pending' }) // e.g., 'pending', 'approved', 'spam'
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => ArticleEntity,
        (article) => article.comments,
        {
            onDelete: 'CASCADE',
            nullable: false,
        }
    )
    article: Relation<ArticleEntity>;

    @TreeChildren()
    children: Relation<CommentEntity[]>;

    @TreeParent({ onDelete: 'CASCADE' })
    parent?: Relation<CommentEntity | null>;
}

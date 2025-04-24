import { AppEntity } from '@be/database/AppEntity';
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
export class CommentEntity extends AppEntity {
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

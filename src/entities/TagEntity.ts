import { AppEntity } from '@be/database/AppEntity';
import { ArticleEntity } from '@be/entities/ArticleEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToMany,
    PrimaryGeneratedColumn,
    type Relation,
    UpdateDateColumn,
} from 'typeorm';

@Entity('tags')
export class TagEntity extends AppEntity {
    @Index({ unique: true })
    @Column({ length: 255 })
    name: string;

    @Index({ unique: true })
    @Column({ length: 255 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @ManyToMany(
        () => ArticleEntity,
        (article) => article.tags
    )
    articles: Relation<ArticleEntity[]>;
}

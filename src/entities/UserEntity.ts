import { BlogDomainEntity } from '@be/entities/BlogDomainEntity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    type Relation,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ length: 255 })
    passwordHash: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    url?: string | null;

    @Column({ length: 50 })
    role: string; // e.g., "admin", "editor", "author"

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageKey?: string | null; // MinIO object key for profile image

    @Column({ type: 'text', nullable: true })
    bio?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(
        () => BlogDomainEntity,
        (domain) => domain.collaborators
    )
    @JoinTable({
        name: 'user_blog_domains', // name of the junction table
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'blogDomainId', referencedColumnName: 'id' },
    })
    blogDomains: Relation<BlogDomainEntity[]>;
}

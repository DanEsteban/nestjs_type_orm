import {
     Column,
     CreateDateColumn,
     Entity,
     PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'login-history' })
export class LoginHistory {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     ip: string;

     @Column()
     browser: string;

     @Column()
     os: string;

     @Column()
     userId: number;

     @Column()
     userName: string;

     @Column({ nullable: true })
     location: string;

     @Column({ nullable: true })
     deviceType: string;

     @CreateDateColumn({ type: 'timestamp' })
     timestamp: Date;
}

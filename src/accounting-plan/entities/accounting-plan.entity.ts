import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'accounting_plan' })
export class AccountingPlan {

     @PrimaryGeneratedColumn()
     id: number;

     @Column({ unique: true })
     code: string;

     @Column({ nullable: false }) 
     name: string;

     @Column({ default: 0 })
     level: number;

     @Column({ nullable: true })
     parent_code: string;

}


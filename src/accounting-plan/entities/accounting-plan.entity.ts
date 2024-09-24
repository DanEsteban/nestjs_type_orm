import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";

@Entity({ name: 'accounting_plan' })
@Tree("closure-table")
export class AccountingPlan {

     @PrimaryGeneratedColumn()
     id: number;

     @Column({ nullable: false }) 
     name: string;

     @Column({unique: true, nullable: false})
     code: string;

     @TreeChildren()
     children: AccountingPlan[];

     @TreeParent()
     parent: AccountingPlan;

     @Column({ unique: true, nullable: true, default: null }) 
     company_code: string;

     @CreateDateColumn({ name: 'created_at' })
     createdAt: Date;

}


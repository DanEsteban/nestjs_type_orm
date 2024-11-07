import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Asiento } from "./asiento.entity";


@Entity({ name: 'asiento_item' })
export class AsientoItem {
     @PrimaryGeneratedColumn()
     id: number;

     // @Column()
     // nro_asiento: string;

     // @Column()
     // nro_linea: number;

     // @Column()
     // codigo_contable: string;

     // @Column()
     // id_asiento_item: string;

     @Column()
     codigo_centro: string;

     @Column()
     cta: string;

     @Column()
     cta_nombre: string;

     @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
     debe: number;

     @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
     haber: number;

     @Column({ nullable: true })
     nota: string;

     // Relación con Asiento
     @ManyToOne(() => Asiento, (asiento) => asiento.items)
     @JoinColumn({ name: 'asiento_id', referencedColumnName: 'id' })
     asiento: Asiento;
}
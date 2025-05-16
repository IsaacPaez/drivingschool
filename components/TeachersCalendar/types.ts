export interface MongoDBObjectId {
  $oid: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  status?: 'scheduled' | 'cancelled' | 'free' | 'canceled';
  _id?: string | MongoDBObjectId;
  studentId?: string | MongoDBObjectId;
}

export interface Class {
  id: string;
  date: Date;
  hour: number;
  status: 'scheduled' | 'cancelled' | 'free';
  studentId?: string | MongoDBObjectId;
  instructorId?: string | MongoDBObjectId;
  slots?: TimeSlot[];
  start?: string;
  end?: string;
  day?: number;
} 
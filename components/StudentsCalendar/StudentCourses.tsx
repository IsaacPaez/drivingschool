import React from "react";

interface Course {
  _id: string;
  title: string;
  length: number;
  price: number;
  instructorId: string;
}

interface Props {
  courses: Course[];
  onSelect: (course: Course) => void;
}

const StudentCourses: React.FC<Props> = ({ courses, onSelect }) => (
  <div className="flex flex-col gap-6 items-center">
    {courses.map(course => (
      <div
        key={course._id}
        className="w-full max-w-xl cursor-pointer p-6 rounded-2xl shadow-2xl border border-[#e0e0e0] bg-white hover:bg-blue-50 transition-all duration-200 text-center"
        onClick={() => onSelect(course)}
      >
        <div className="font-bold text-xl text-[#0056b3] mb-2">{course.title}</div>
        <div className="text-md text-gray-500">{course.length}h - ${course.price}</div>
      </div>
    ))}
    {courses.length === 0 && <div className="text-gray-400">No courses found</div>}
  </div>
);

export default StudentCourses; 
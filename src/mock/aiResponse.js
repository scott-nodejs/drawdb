/**
 * @description AI助手API响应的mock数据
 */
export const mockAIResponse = {
  "output": {
    "finish_reason": "stop",
    "session_id": "4082d6c84bba487882c1dce0e72a9382",
    "text": `{
      "tables": [
        {
          "id": 0,
          "name": "students",
          "x": 100,
          "y": 50,
          "fields": [
            {
              "name": "id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": true,
              "unique": true,
              "notNull": true,
              "increment": true,
              "comment": "学生唯一标识",
              "id": 0
            },
            {
              "name": "first_name",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "学生名字",
              "id": 1,
              "size": 255
            },
            {
              "name": "last_name",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "学生姓氏",
              "id": 2,
              "size": 255
            },
            {
              "name": "dob",
              "type": "DATE",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": false,
              "increment": false,
              "comment": "出生日期",
              "id": 3
            },
            {
              "name": "class_id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": false,
              "increment": false,
              "comment": "所属班级ID",
              "id": 4
            },
            {
              "name": "enrollment_date",
              "type": "DATE",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": false,
              "increment": false,
              "comment": "入学日期",
              "id": 5
            }
          ],
          "comment": "存储学生的基本信息",
          "indices": [],
          "color": "#a751e8"
        },
        {
          "id": 1,
          "name": "classes",
          "x": 300,
          "y": 50,
          "fields": [
            {
              "name": "id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": true,
              "unique": true,
              "notNull": true,
              "increment": true,
              "comment": "班级唯一标识",
              "id": 0
            },
            {
              "name": "name",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": true,
              "notNull": true,
              "increment": false,
              "comment": "班级名称",
              "id": 1,
              "size": 255
            },
            {
              "name": "teacher_id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": false,
              "increment": false,
              "comment": "班主任ID",
              "id": 2
            }
          ],
          "comment": "存储班级信息",
          "indices": [],
          "color": "#6360f7"
        },
        {
          "id": 2,
          "name": "teachers",
          "x": 500,
          "y": 50,
          "fields": [
            {
              "name": "id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": true,
              "unique": true,
              "notNull": true,
              "increment": true,
              "comment": "教师唯一标识",
              "id": 0
            },
            {
              "name": "first_name",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "教师名字",
              "id": 1,
              "size": 255
            },
            {
              "name": "last_name",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "教师姓氏",
              "id": 2,
              "size": 255
            },
            {
              "name": "subject",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": false,
              "increment": false,
              "comment": "教授科目",
              "id": 3,
              "size": 255
            }
          ],
          "comment": "存储教师信息",
          "indices": [],
          "color": "#32c9b0"
        },
        {
          "id": 3,
          "name": "grades",
          "x": 700,
          "y": 50,
          "fields": [
            {
              "name": "id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": true,
              "unique": true,
              "notNull": true,
              "increment": true,
              "comment": "成绩记录唯一标识",
              "id": 0
            },
            {
              "name": "student_id",
              "type": "INT",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "学生ID",
              "id": 1
            },
            {
              "name": "subject",
              "type": "VARCHAR",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "科目名称",
              "id": 2,
              "size": 255
            },
            {
              "name": "score",
              "type": "DECIMAL",
              "default": "",
              "check": "",
              "primary": false,
              "unique": false,
              "notNull": true,
              "increment": false,
              "comment": "成绩分数",
              "id": 3,
              "size": "5,2"
            }
          ],
          "comment": "存储学生成绩信息",
          "indices": [],
          "color": "#ffcc00"
        }
      ],
      "relationships": [
        {
          "id": 0,
          "startTableId": 0,
          "startFieldId": 4,
          "endTableId": 1,
          "endFieldId": 0,
          "name": "students_class_id_fk",
          "cardinality": "Many to one",
          "updateConstraint": "No action",
          "deleteConstraint": "No action"
        },
        {
          "startTableId": 1,
          "startFieldId": 2,
          "endTableId": 2,
          "endFieldId": 0,
          "name": "classes_teacher_id_fk",
          "cardinality": "Many to one",
          "updateConstraint": "No action",
          "deleteConstraint": "No action",
          "id": 1
        },
        {
          "startTableId": 3,
          "startFieldId": 1,
          "endTableId": 0,
          "endFieldId": 0,
          "name": "grades_student_id_fk",
          "cardinality": "Many to one",
          "updateConstraint": "No action",
          "deleteConstraint": "No action",
          "id": 2
        }
      ],
      "notes": [],
      "subjectAreas": [],
      "types": [],
      "title": "学生管理系统表结构",
      "description": "一个用于管理学校学生、班级、教师及成绩的系统，包含基本的学生与班级关联、教师分配以及成绩记录功能。",
      "custom": 0
    }`
  },
  "usage": {
    "models": [
      {
        "output_tokens": 1612,
        "model_id": "qwen-max-latest",
        "input_tokens": 1436
      }
    ]
  },
  "request_id": "594be623-9e48-9d3e-b0cf-1b582d84665d"
}; 
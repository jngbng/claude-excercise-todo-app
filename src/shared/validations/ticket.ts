import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createTicketSchema = z.object({
  title: z
    .string({ required_error: '제목을 입력해주세요' })
    .trim()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  description: z
    .string()
    .max(1000, '설명은 1000자 이내로 입력해주세요')
    .nullable()
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'], {
      errorMap: () => ({ message: '우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요' }),
    })
    .optional()
    .default('MEDIUM'),
  plannedStartDate: dateString.nullable().optional(),
  dueDate: dateString
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(value) >= today;
      },
      { message: '종료예정일은 오늘 이후 날짜를 선택해주세요' },
    ),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

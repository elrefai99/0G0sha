import { TemplateModel, AppError, createLogger } from '@/gen-import'

const logger = createLogger('TemplateService')

const LIST_PROJECTION = {
     name: 1,
     category: 1,
     description: 1,
     exampleInput: 1,
     exampleOutput: 1,
} as const

export const listTemplates = async (
     category?: string,
): Promise<unknown[]> => {
     const filter: Record<string, unknown> = { isActive: true }
     if (category) filter.category = category

     logger.debug({ category }, 'Listing templates')

     return TemplateModel.find(filter, LIST_PROJECTION)
          .sort({ category: 1, name: 1 })
          .lean()
          .exec()
}

export const getTemplateById = async (
     id: string,
): Promise<unknown> => {
     const template = await TemplateModel.findById(id)
          .lean()
          .exec()

     if (!template) throw AppError.notFound('Template not found')

     return template
}

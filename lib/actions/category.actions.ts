"use server"

import { CreateCategoryParams } from "@/types"
import { handleError } from "../utils"
import { Category } from "../database/models/category.model"

export const createCategory = async ({ categoryName }: CreateCategoryParams) => {
  try {
    // No need to call connectToDatabase() as Vercel Postgres handles connections automatically
    const newCategory = await Category.create({ categoryName });
    return newCategory; // No need for JSON.parse(JSON.stringify()) as the data is already in the correct format
  } catch (error) {
    handleError(error)
  }
}

export const getAllCategories = async () => {
  try {
    // No need to call connectToDatabase() as Vercel Postgres handles connections automatically
    const categories = await Category.findAll();
    return categories; // No need for JSON.parse(JSON.stringify()) as the data is already in the correct format
  } catch (error) {
    handleError(error)
  }
}

// New function to check if a category exists
export const checkCategoryExists = async (categoryName: string) => {
  try {
    const existingCategory = await Category.findByName(categoryName);
    return !!existingCategory; // Returns true if the category exists, false otherwise
  } catch (error) {
    handleError(error)
    return false; // Assume the category doesn't exist if there's an error
  }
}
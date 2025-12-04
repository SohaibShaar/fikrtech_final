import { Request, Response } from "express";
import prisma from "../config/database";

// 🧩 جلب الباقات مع عوامل التصفية
export const getPackages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { level, mode } = req.query;

    const packages = await prisma.tutoringPackage.findMany({
      where: {
        level: level ? (String(level).toUpperCase() as any) : undefined,
        mode: mode ? (String(mode).toUpperCase() as any) : undefined,
        isActive: true,
      },
      orderBy: { priceAED: "asc" },
    });

    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
};

// ➕ إضافة باقة جديدة
export const createPackage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      level,
      mode,
      paidHours,
      freeSessions,
      totalHours,
      priceAED,
      effectiveRateAED,
      shortNote,
    } = req.body;

    const newPackage = await prisma.tutoringPackage.create({
      data: {
        title,
        level,
        mode,
        paidHours: Number(paidHours),
        freeSessions: Number(freeSessions),
        totalHours: Number(totalHours),
        priceAED: Number(priceAED),
        effectiveRateAED: Number(effectiveRateAED),
        shortNote,
      },
    });

    res.status(201).json(newPackage);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "لم يتم إضافة الباقة" });
  }
};

// ❌ حذف باقة حسب ID
export const deletePackage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tutoringPackage.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "تم حذف الباقة بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "لم يتم العثور على الباقة" });
  }
};

// 📦 جلب باقة واحدة حسب ID
export const getPackageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const pkg = await prisma.tutoringPackage.findUnique({
      where: { id: Number(id) },
    });

    if (!pkg) {
      res.status(404).json({ error: "الباقة غير موجودة" });
      return;
    }

    res.json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء الجلب" });
  }
};

// ✏️ تحديث باقة موجودة
export const updatePackage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      level,
      mode,
      paidHours,
      freeSessions,
      totalHours,
      priceAED,
      effectiveRateAED,
      shortNote,
    } = req.body;

    // التحقق من وجود الباقة
    const existingPackage = await prisma.tutoringPackage.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPackage) {
      res.status(404).json({ error: "الباقة غير موجودة" });
      return;
    }

    // تحديث الباقة
    const updatedPackage = await prisma.tutoringPackage.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(level && { level }),
        ...(mode && { mode }),
        ...(paidHours !== undefined && { paidHours: Number(paidHours) }),
        ...(freeSessions !== undefined && {
          freeSessions: Number(freeSessions),
        }),
        ...(totalHours !== undefined && { totalHours: Number(totalHours) }),
        ...(priceAED !== undefined && { priceAED: Number(priceAED) }),
        ...(effectiveRateAED !== undefined && {
          effectiveRateAED: Number(effectiveRateAED),
        }),
        ...(shortNote && { shortNote }),
      },
    });

    res.json(updatedPackage);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "لم يتم تحديث الباقة" });
  }
};

import { handleError } from "@/lib/handlers/errors";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import slugify from "slugify";

import mongoose from "mongoose";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { NextResponse } from "next/server";

// Create accounts using OAuth by Github or Google
export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { name, username, email, image } = user;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: slugifiedUsername, email, image }],
        { session }
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) {
        updatedData.name = name;
      }

      if (existingUser.image !== image) {
        updatedData.image = image;
      }

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          {
            _id: existingUser._id,
          },
          { $set: updatedData }
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    session.endSession();
  }
}

// ? Mongoose sessions are a part of mongodb`s transactions feature. Allowing a multiple operations to be executed in a single atomic unit.
// ? They ensure that all operations either succeed or none are apply, making them useful for maintaining data consistency in complex operations
// ? like multi document updates.

// ! if we try to create an account --> FAILS
// ! than we try to create a user --> FAILS

//* When you start a new session it allows you to start a transaction.

// Сеансы Mongoose являются частью функции транзакций MongoDB. Они позволяют выполнять несколько операций в рамках одной атомарной единицы.
// Они гарантируют, что все операции либо будут выполнены успешно, либо ни одна из них не будет выполнена, что делает их полезными для поддержания согласованности данных в сложных операциях,
// например, при обновлении нескольких документов.

// Это означает, что если мы пытаемся создать учётную запись --> НЕУДАЧНО
// то мы пытаемся создать пользователя --> НЕУДАЧНО

// При запуске нового сеанса это позволяет начать транзакцию.

// ! Atomic functions - either all of them or none of them !

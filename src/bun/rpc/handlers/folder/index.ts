/**
 * @fileoverview RPC Handlers for Folder Operations
 *
 * This file contains the RPC handlers responsible for managing user-selected
 * "watched folders" within the BurrowStream local environment. It facilitates
 * native OS folder selection, local database persistence, and clean data teardown.
 *
 * ### Architecture Role
 * - **OS Bridge**: Invokes native desktop file picker dialogs via Electrobun utilities.
 * - **Data Lifecycle**: Manages CRUD actions on `watchedFolders` using Drizzle ORM.
 * - **Cascading Cleanup**: Handles side effects of folder removal, purging down
 *   associated local metadata streams (videos, scan history, activity logs).
 *
 * ### Exposed Handlers
 * - `getFolders`   : Retrieves all watched directories ordered by newest creation date.
 * - `addFolder`    : Triggers OS-native folder selection dialog and registers a unique path.
 * - `removeFolder` : Deletes a folder record and cascades cleanup across metadata tables.
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { platform } from "node:os";

import { Utils } from "electrobun";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { RemoveFolderRequest } from "../../../../shared/rpc/definitions";

import { db } from "../../../db/client";
import {
  watchedFolders,
  activityLog,
  videos,
  scanHistory,
} from "../../../db/schema";

// logger
import logger from "../../../logger";

export async function getFolders() {
  return db
    .select()
    .from(watchedFolders)
    .orderBy(desc(watchedFolders.createdAt))
    .all();
}

export async function addFolder() {
  const defaultPaths: Record<string, string> = {
    darwin: join(homedir(), "Desktop"),
    win32: join(homedir(), "Desktop"),
    linux: homedir(),
  };

  const startingFolder = defaultPaths[platform()] || homedir();

  // This returns an array of selected paths
  const chosenPaths = await Utils.openFileDialog({
    startingFolder,
    allowedFileTypes: "*",
    canChooseFiles: false, // We want folders
    canChooseDirectory: true, // Allow folder selection
    allowsMultipleSelection: false, // Single folder
  });

  if (!chosenPaths || chosenPaths.length === 0) {
    logger.error("No folder selected");
    return { success: false, error: "No folder selected" };
  }

  const folderPath = chosenPaths[0];

  // add the folder to the database
  const existing = db
    .select()
    .from(watchedFolders)
    .where(eq(watchedFolders.path, folderPath))
    .get();

  if (existing) {
    logger.error("Folder already being watched");
    return { success: false, error: "Folder already being watched" };
  }

  // prevent adding empty chosen path
  if (folderPath.trim() === "") {
    logger.error("Invalid folder path");
    return { success: false, error: "Invalid folder path" };
  }

  const now = Date.now();
  const folder = db
    .insert(watchedFolders)
    .values({
      path: folderPath,
      name: folderPath.split("/").pop() || folderPath,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  db.insert(activityLog)
    .values({
      level: "info",
      category: "user",
      message: `Added folder: ${folder.name}`,
      createdAt: now,
    })
    .run();

  logger.info(`Added folder: ${folder.name}`);
  return { success: true, data: { folderId: folder.id } };
}

export async function removeFolder(
  params: z.infer<typeof RemoveFolderRequest>,
) {
  const { id } = RemoveFolderRequest.parse(params);

  const folder = db
    .select()
    .from(watchedFolders)
    .where(eq(watchedFolders.id, id))
    .get();

  if (!folder) {
    return { success: false, error: "Folder not found" };
  }

  // cascade delete all videos, scan history, and watched folders
  db.delete(videos).where(eq(videos.folderId, id)).run();
  db.delete(scanHistory).where(eq(scanHistory.folderId, id)).run();
  db.delete(watchedFolders).where(eq(watchedFolders.id, id)).run();

  // insert an activity log
  db.insert(activityLog)
    .values({
      level: "info",
      category: "user",
      message: `Removed folder: ${folder.name}`,
      createdAt: Date.now(),
    })
    .run();

  return { success: true };
}

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class FFmpegUtils {
  static async generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
    const command = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${outputPath}"`;

    try {
      await execAsync(command);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw error;
    }
  }

  static async getVideoDuration(videoPath: string): Promise<number> {
    const command = `ffprobe -v quiet -show_entries format=duration -of csv="p=0" "${videoPath}"`;

    try {
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim());
    } catch (error) {
      console.error("Error getting video duration:", error);
      return 0;
    }
  }

  static async convertToHLS(inputPath: string, outputDir: string): Promise<void> {
    const command = `ffmpeg -i "${inputPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputDir}/playlist.m3u8"`;

    try {
      await execAsync(command);
    } catch (error) {
      console.error("Error converting to HLS:", error);
      throw error;
    }
  }
}

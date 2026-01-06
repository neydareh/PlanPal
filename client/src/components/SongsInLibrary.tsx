import { Song } from "@shared/schema";
import { Music } from "lucide-react";
import { Card, CardContent } from "@planpal/ui";

const SongsInLibrary = ({ songs }: { songs: Song[] }) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-secondary-100 dark:bg-secondary-900/30">
            <Music className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Songs in Library
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {songs.length}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Ready to use
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongsInLibrary;

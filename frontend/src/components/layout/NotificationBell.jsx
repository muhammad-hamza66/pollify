import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ThumbsUp, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationsApi } from "../../api/notifications";
import { useClickOutside } from "../../hooks/useClickOutside";
import { timeAgo } from "../../utils/formatTime";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const load = async () => {
    try {
      const data = await notificationsApi.list();
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      /* silent -- non-critical widget */
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // lightweight polling, no websocket on this backend
    return () => clearInterval(id);
  }, []);

  const onOpen = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      setLoading(true);
      try {
        await notificationsApi.markAllRead();
        setUnread(0);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onOpen}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#64748b] dark:hover:text-gray-300 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold animate-scale-in">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark-elevated border border-[#e2e8f0] dark:border-gray-800 rounded-xl shadow-dropdown p-2 max-h-96 overflow-y-auto scrollbar-thin z-20"
          >
            <p className="px-2 py-1.5 text-sm font-semibold text-[#0f172a] dark:text-gray-100">
              Notifications
            </p>
            {items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="You're all caught up"
                description="Votes and comments on your polls show up here."
              />
            ) : (
              items.map((n) => (
                <Link
                  key={n._id}
                  to={n.poll ? `/polls/${n.poll._id}` : "#"}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar
                    src={n.actor?.avatar}
                    name={n.actor?.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0f172a] dark:text-gray-200">
                      <span className="font-medium">{n.actor?.name}</span>{" "}
                      {n.type === "vote" ? "voted on" : "commented on"}{" "}
                      <span className="text-[#64748b]">
                        "{n.poll?.question?.slice(0, 40)}"
                      </span>
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {n.type === "vote" ? (
                    <ThumbsUp className="h-3.5 w-3.5 text-primary-500 mt-1 flex-shrink-0" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5 text-accent-500 mt-1 flex-shrink-0" />
                  )}
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

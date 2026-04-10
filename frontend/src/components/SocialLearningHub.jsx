import { useState, useEffect } from 'react';

export const SocialLearningHub = () => {
  const [studyGroups, setStudyGroups] = useState([]);
  const [peerProgress, setPeerProgress] = useState([]);
  const [collaborativeSessions, setCollaborativeSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching social learning data
    setTimeout(() => {
      setStudyGroups([
        {
          id: 1,
          name: 'Mathematics Masters',
          members: 8,
          subject: 'Mathematics',
          nextSession: 'Today, 3:00 PM',
          progress: 75,
          description: 'Advanced calculus and problem-solving'
        },
        {
          id: 2,
          name: 'Physics Explorers',
          members: 6,
          subject: 'Physics',
          nextSession: 'Tomorrow, 4:00 PM',
          progress: 60,
          description: 'Quantum mechanics and thermodynamics'
        },
        {
          id: 3,
          name: 'Chemistry Lab Partners',
          members: 10,
          subject: 'Chemistry',
          nextSession: 'Friday, 2:00 PM',
          progress: 45,
          description: 'Organic chemistry and lab techniques'
        }
      ]);

      setPeerProgress([
        {
          name: 'Alex Johnson',
          subject: 'Mathematics',
          progress: 85,
          streak: 12,
          avatar: '👨‍🎓'
        },
        {
          name: 'Sarah Chen',
          subject: 'Physics',
          progress: 78,
          streak: 8,
          avatar: '👩‍🎓'
        },
        {
          name: 'Mike Wilson',
          subject: 'Chemistry',
          progress: 92,
          streak: 15,
          avatar: '👨‍🔬'
        },
        {
          name: 'Emma Davis',
          subject: 'Biology',
          progress: 70,
          streak: 6,
          avatar: '👩‍🔬'
        }
      ]);

      setCollaborativeSessions([
        {
          title: 'Calculus Study Session',
          host: 'Alex Johnson',
          participants: 5,
          time: 'Today, 3:00 PM',
          duration: '2 hours',
          topic: 'Integration techniques'
        },
        {
          title: 'Physics Problem Solving',
          host: 'Sarah Chen',
          participants: 4,
          time: 'Tomorrow, 4:00 PM',
          duration: '1.5 hours',
          topic: 'Wave mechanics'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🤝 Social Learning Hub</h2>
        <p className="text-green-100">Connect, collaborate, and learn together with peers</p>
      </div>

      {/* Study Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📚 Active Study Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studyGroups.map((group, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">{group.members} members</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{group.description}</div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${group.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{group.progress}% complete</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  📅 {group.nextSession}
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👥 Peer Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {peerProgress.map((peer, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{peer.avatar}</div>
              <div className="font-semibold text-gray-900 dark:text-white">{peer.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{peer.subject}</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{peer.progress}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">🔥 {peer.streak} day streak</div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborative Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Upcoming Collaborative Sessions</h3>
        <div className="space-y-4">
          {collaborativeSessions.map((session, index) => (
            <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{session.title}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Host: {session.host} | Topic: {session.topic}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>👥 {session.participants} participants</span>
                    <span>⏰ {session.time}</span>
                    <span>⏱️ {session.duration}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Join Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Learning Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-6">📊 Social Learning Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24</div>
            <div className="text-purple-100">Study Partners</div>
            <div className="text-sm text-purple-200 mt-1">Active collaborators</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">89%</div>
            <div className="text-purple-100">Collaboration Score</div>
            <div className="text-sm text-purple-200 mt-1">Excellent teamwork</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">15</div>
            <div className="text-purple-100">Group Sessions</div>
            <div className="text-sm text-purple-200 mt-1">This month</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.8</div>
            <div className="text-purple-100">Peer Rating</div>
            <div className="text-sm text-purple-200 mt-1">Out of 5.0</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Create Study Group</div>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <div className="text-2xl mb-2">🎥</div>
            <div className="text-sm font-medium text-green-900 dark:text-green-100">Start Video Session</div>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Share Notes</div>
          </button>
          <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-medium text-orange-900 dark:text-orange-100">Challenge Peers</div>
          </button>
        </div>
      </div>
    </div>
  );
};

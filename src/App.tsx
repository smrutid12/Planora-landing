import { useState } from 'react';
import { Sparkles, Calendar, Plus, Coffee, Footprints, Check, AlertCircle, Mail, MessageCircle, Instagram, CalendarCheck } from 'lucide-react';
import { supabase } from './lib/supabase';

interface Mood {
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
}

interface Task {
  text: string;
  completed: boolean;
}

const moods: Mood[] = [
  { name: 'Happy', emoji: '😄', color: '#FFD700', bgGradient: 'from-yellow-50 to-amber-100' },
  { name: 'Calm', emoji: '🌊', color: '#00BFFF', bgGradient: 'from-blue-50 to-cyan-100' },
  { name: 'Stressed', emoji: '😫', color: '#FF4500', bgGradient: 'from-orange-50 to-red-100' },
  { name: 'Tired', emoji: '😴', color: '#708090', bgGradient: 'from-slate-50 to-gray-100' },
  { name: 'Excited', emoji: '🤩', color: '#FF69B4', bgGradient: 'from-pink-50 to-rose-100' }
];

const moodTasks: Record<string, string[]> = {
  Happy: ['Start that creative project', 'Connect with friends', 'Try something new'],
  Calm: ['Deep work session', 'Read a book', 'Practice meditation'],
  Stressed: ['Take short breaks', 'Prioritize top 3 tasks', 'Delegate when possible'],
  Tired: ['Light administrative tasks', 'Schedule rest time', 'Gentle exercise'],
  Excited: ['Tackle challenging projects', 'Brainstorm new ideas', 'Network and collaborate']
};

const MAX_TASKS = 8;

function App() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setTasks([]);
  };

  const addTask = () => {
    if (newTask.trim()) {
      const incompleteTasks = tasks.filter(t => !t.completed).length;
      if (incompleteTasks >= MAX_TASKS) {
        setShowOverloadWarning(true);
        setTimeout(() => setShowOverloadWarning(false), 5000);
        return;
      }
      setTasks([...tasks, { text: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const addSuggestion = (suggestion: string) => {
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    if (incompleteTasks >= MAX_TASKS) {
      setShowOverloadWarning(true);
      setTimeout(() => setShowOverloadWarning(false), 5000);
      return;
    }
    setTasks([...tasks, { text: suggestion, completed: false }]);
  };

  const handleWaitlistSignup = async () => {
    if (!email.trim() || !email.includes('@')) {
      setEmailStatus('error');
      setEmailMessage('Please enter a valid email address');
      setTimeout(() => setEmailStatus('idle'), 3000);
      return;
    }

    setEmailStatus('loading');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === '23505') {
          setEmailStatus('error');
          setEmailMessage('This email is already on the waitlist!');
        } else {
          throw error;
        }
      } else {
        setEmailStatus('success');
        setEmailMessage('Welcome to the waitlist! We\'ll keep you updated.');
        setEmail('');
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage('Something went wrong. Please try again.');
    }

    setTimeout(() => setEmailStatus('idle'), 5000);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${selectedMood?.bgGradient || 'from-slate-50 to-blue-50'}`}>
      {/* Header */}
      <header className="pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Planora
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 font-light">
            Your Mood-Aware Task Planner
          </p>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Planora adapts to your mood and helps you plan your day intelligently with AI task suggestions
          </p>
        </div>
      </header>

      {/* Mood Selector */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
            How are you feeling today?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {moods.map((mood) => (
              <button
                key={mood.name}
                onClick={() => handleMoodSelect(mood)}
                className={`group relative px-8 py-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedMood?.name === mood.name ? 'ring-4 ring-offset-2' : ''
                }`}
                style={{
                  ringColor: selectedMood?.name === mood.name ? mood.color : 'transparent'
                }}
              >
                <div className="text-5xl mb-2">{mood.emoji}</div>
                <div className="text-lg font-medium text-gray-800">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Task Section */}
      {selectedMood && (
        <section className="px-4 py-12 animate-fadeIn">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
              <h2 className="text-3xl font-semibold mb-3 text-gray-800">
                What do you want to do today?
              </h2>
              <p className="text-gray-600 mb-8">
                Based on your {selectedMood.name.toLowerCase()} mood, here are some suggestions:
              </p>

              {/* Task Input */}
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a new task..."
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg transition-colors"
                />
                <button
                  onClick={addTask}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              {/* Overload Warning */}
              {showOverloadWarning && (
                <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 font-medium">
                    Don't overload yourself! You already have {tasks.filter(t => !t.completed).length} tasks. Consider completing some before adding more.
                  </p>
                </div>
              )}

              {/* Task Counter */}
              <div className="mb-8 text-center">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">{tasks.filter(t => !t.completed).length}</span> active tasks •
                  <span className="font-semibold text-green-600"> {tasks.filter(t => t.completed).length}</span> completed
                </p>
              </div>

              {/* Task Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    onClick={() => toggleTask(index)}
                    className={`p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                      task.completed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 group-hover:border-blue-500'
                      }`}>
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <p className={`text-gray-800 font-medium flex-1 ${
                        task.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="border-t-2 border-gray-200 pt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Smart Suggestions
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {moodTasks[selectedMood.name].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addSuggestion(suggestion)}
                      className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:scale-105 text-left group"
                    >
                      <p className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => addSuggestion('Take a 5-minute break')}
                  className="px-6 py-3 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 font-medium"
                >
                  <Coffee className="w-5 h-5" />
                  Take a break
                </button>
                <button
                  onClick={() => addSuggestion('Go for a 10-minute walk')}
                  className="px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 font-medium"
                >
                  <Footprints className="w-5 h-5" />
                  Go for a walk
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Integrations Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <CalendarCheck className="w-16 h-16 mx-auto mb-6 text-blue-600" />
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">
              Stay Connected Everywhere
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Planora integrates seamlessly with your favorite apps and sends notifications wherever you are.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl text-left">
                <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Google Calendar Sync</h3>
                <p className="text-gray-700 mb-4">Automatically sync your tasks with Google Calendar. Never miss a deadline with smart scheduling.</p>
                <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                  <Check className="w-5 h-5" />
                  Two-way sync
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl text-left">
                <Mail className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Email Notifications</h3>
                <p className="text-gray-700 mb-4">Get daily summaries and reminders straight to your inbox. Stay on top of your schedule effortlessly.</p>
                <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                  <Check className="w-5 h-5" />
                  Smart digests
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl text-left">
                <MessageCircle className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">WhatsApp Updates</h3>
                <p className="text-gray-700 mb-4">Receive task reminders and updates directly on WhatsApp. Manage your day from your favorite chat app.</p>
                <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                  <Check className="w-5 h-5" />
                  Instant alerts
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl text-left">
                <Instagram className="w-12 h-12 text-pink-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Instagram DMs</h3>
                <p className="text-gray-700 mb-4">Get motivational task updates via Instagram direct messages. Stay inspired throughout your day.</p>
                <div className="inline-flex items-center gap-2 text-pink-600 font-medium">
                  <Check className="w-5 h-5" />
                  Daily motivation
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                <div className="text-3xl font-bold text-slate-600 mb-2">AI-Powered</div>
                <p className="text-gray-700">Smart task suggestions based on your mood and energy levels</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                <div className="text-3xl font-bold text-amber-600 mb-2">Adaptive</div>
                <p className="text-gray-700">Your planner adjusts to how you're feeling in real-time</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                <div className="text-3xl font-bold text-cyan-600 mb-2">Intuitive</div>
                <p className="text-gray-700">Beautiful, easy-to-use interface that feels natural</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Join the Waitlist
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Be the first to experience Planora when we launch. Get exclusive early access and updates.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleWaitlistSignup()}
                  placeholder="Enter your email..."
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg transition-colors"
                  disabled={emailStatus === 'loading'}
                />
                <button
                  onClick={handleWaitlistSignup}
                  disabled={emailStatus === 'loading'}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailStatus === 'loading' ? (
                    <span>Joining...</span>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Join
                    </>
                  )}
                </button>
              </div>

              {emailStatus === 'success' && (
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 font-medium">{emailMessage}</p>
                </div>
              )}

              {emailStatus === 'error' && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{emailMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-12 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-lg">
            Start planning smarter, not harder
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;

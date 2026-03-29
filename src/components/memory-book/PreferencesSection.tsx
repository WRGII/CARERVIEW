import { useState, useEffect } from "react";
import { Save, Heart } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import {
  useMemoryBookPreferences,
  useUpsertMemoryBookPreferences,
} from "../../hooks/useMemoryBook";
import ReadOnlyBanner from "./ReadOnlyBanner";
import SectionEmptyState from "./SectionEmptyState";

type Props = {
  memoryBookId: string;
  teamId: string;
  isOwner: boolean;
};

const EMPTY_FORM = {
  likes: "",
  dislikes: "",
  foods_liked: "",
  foods_disliked: "",
  music_preferences: "",
  conversation_topics: "",
  comforts: "",
  fears: "",
  sensory_preferences: "",
  things_to_avoid: "",
};

export default function PreferencesSection({ memoryBookId, teamId, isOwner }: Props) {
  const { data: prefs, isLoading } = useMemoryBookPreferences(memoryBookId);
  const upsert = useUpsertMemoryBookPreferences();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [memoryBookId]);

  useEffect(() => {
    if (prefs) {
      setForm({
        likes: prefs.likes ?? "",
        dislikes: prefs.dislikes ?? "",
        foods_liked: prefs.foods_liked ?? "",
        foods_disliked: prefs.foods_disliked ?? "",
        music_preferences: prefs.music_preferences ?? "",
        conversation_topics: prefs.conversation_topics ?? "",
        comforts: prefs.comforts ?? "",
        fears: prefs.fears ?? "",
        sensory_preferences: prefs.sensory_preferences ?? "",
        things_to_avoid: prefs.things_to_avoid ?? "",
      });
    }
  }, [prefs]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ memoryBookId, teamId, values: form });
      showToast("Preferences saved", "success");
      setEditing(false);
    } catch (e: any) {
      showToast(e.message ?? "Failed to save", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const hasData = !!prefs;
  const isReadOnly = !isOwner;

  if (!hasData && !isOwner) {
    return (
      <SectionEmptyState
        title="Preferences not yet completed"
        description="The team owner needs to fill in the preferences section before it appears here."
        isOwner={false}
      />
    );
  }

  if (!hasData && isOwner && !editing) {
    return (
      <SectionEmptyState
        title="Add likes, dislikes &amp; comforts"
        description="Recording what brings comfort, joy, and what to avoid helps every caregiver provide a more personal experience."
        isOwner={true}
        ownerAction={
          <Button variant="primary" size="md" onClick={() => setEditing(true)}>
            <Heart className="w-4 h-4 mr-2 inline" />
            Add Preferences
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {isReadOnly && <ReadOnlyBanner />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Likes, Dislikes &amp; Comforts</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                What brings joy, comfort, and what to avoid
              </p>
            </div>
            {isOwner && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing && isOwner ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label="What they enjoy / makes them happy"
                  value={form.likes}
                  onChange={v => setForm(f => ({ ...f, likes: v }))}
                  placeholder="Activities, topics, experiences they love..."
                />
                <TextareaField
                  label="What they dislike"
                  value={form.dislikes}
                  onChange={v => setForm(f => ({ ...f, dislikes: v }))}
                  placeholder="Things that cause discomfort or frustration..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label="Foods they enjoy"
                  value={form.foods_liked}
                  onChange={v => setForm(f => ({ ...f, foods_liked: v }))}
                  placeholder="Favourite foods, meals, snacks..."
                  rows={3}
                />
                <TextareaField
                  label="Foods they dislike or avoid"
                  value={form.foods_disliked}
                  onChange={v => setForm(f => ({ ...f, foods_disliked: v }))}
                  placeholder="Food dislikes, texture aversions..."
                  rows={3}
                />
              </div>
              <TextareaField
                label="Music preferences"
                value={form.music_preferences}
                onChange={v => setForm(f => ({ ...f, music_preferences: v }))}
                placeholder="Favourite genres, artists, songs, or instruments..."
              />
              <TextareaField
                label="Good conversation topics"
                value={form.conversation_topics}
                onChange={v => setForm(f => ({ ...f, conversation_topics: v }))}
                placeholder="Topics they enjoy talking about — family, history, sport, hobbies..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label="What comforts them when upset"
                  value={form.comforts}
                  onChange={v => setForm(f => ({ ...f, comforts: v }))}
                  placeholder="Music, a specific person, a routine, touch, words..."
                  rows={3}
                />
                <TextareaField
                  label="Fears / distress triggers"
                  value={form.fears}
                  onChange={v => setForm(f => ({ ...f, fears: v }))}
                  placeholder="What causes fear, agitation, or distress..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextareaField
                  label="Sensory preferences"
                  value={form.sensory_preferences}
                  onChange={v => setForm(f => ({ ...f, sensory_preferences: v }))}
                  placeholder="Lighting, noise level, temperature, touch preferences..."
                  rows={3}
                />
                <TextareaField
                  label="Things to avoid"
                  value={form.things_to_avoid}
                  onChange={v => setForm(f => ({ ...f, things_to_avoid: v }))}
                  placeholder="Topics, situations, people, or environments to avoid..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="primary" size="md" onClick={handleSave} disabled={upsert.isPending}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  {upsert.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setEditing(false);
                    if (prefs) {
                      setForm({
                        likes: prefs.likes ?? "",
                        dislikes: prefs.dislikes ?? "",
                        foods_liked: prefs.foods_liked ?? "",
                        foods_disliked: prefs.foods_disliked ?? "",
                        music_preferences: prefs.music_preferences ?? "",
                        conversation_topics: prefs.conversation_topics ?? "",
                        comforts: prefs.comforts ?? "",
                        fears: prefs.fears ?? "",
                        sensory_preferences: prefs.sensory_preferences ?? "",
                        things_to_avoid: prefs.things_to_avoid ?? "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ReadBlock label="Enjoys / Makes Happy" value={prefs?.likes} />
              <ReadBlock label="Dislikes" value={prefs?.dislikes} />
              <ReadBlock label="Foods Enjoyed" value={prefs?.foods_liked} />
              <ReadBlock label="Foods to Avoid" value={prefs?.foods_disliked} />
              <ReadBlock label="Music Preferences" value={prefs?.music_preferences} />
              <ReadBlock label="Good Conversation Topics" value={prefs?.conversation_topics} />
              <ReadBlock label="Comforts When Upset" value={prefs?.comforts} />
              <ReadBlock label="Fears / Distress Triggers" value={prefs?.fears} />
              <ReadBlock label="Sensory Preferences" value={prefs?.sensory_preferences} />
              <ReadBlock label="Things to Avoid" value={prefs?.things_to_avoid} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <textarea
        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base placeholder-slate-400 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 bg-white text-slate-800 leading-relaxed"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function ReadBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
